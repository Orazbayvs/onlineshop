from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework import serializers

from .models import Category, Order, OrderItem, Payment, Product, User


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    is_superuser = serializers.BooleanField(read_only=True)
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    address = serializers.CharField(max_length=200, required=True)
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'first_name', 'last_name', 'phone',
            'address', 'role', 'shop_name', 'shop_address', 'latitude', 'longitude',
            'is_superuser', 'created_at',
        )

    def validate_role(self, value):
        if value not in ('buyer', 'seller'):
            raise serializers.ValidationError('Only buyer and seller accounts can register.')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('User with this email already exists')
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(max_length=150, required=True)
    last_name = serializers.CharField(max_length=150, required=True)
    address = serializers.CharField(max_length=200, required=True)
    created_at = serializers.DateTimeField(source='date_joined', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'address', 'role', 'created_at')
        read_only_fields = ('id', 'role', 'created_at')

    def validate_email(self, value):
        if User.objects.exclude(pk=self.instance.pk).filter(email=value).exists():
            raise serializers.ValidationError('User with this email already exists.')
        return value


class CategorySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='name', read_only=True)

    class Meta:
        model = Category
        fields = ('id', 'name', 'category_name', 'description', 'is_active')


class ProductSerializer(serializers.ModelSerializer):
    owner = serializers.PrimaryKeyRelatedField(read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    product_name = serializers.CharField(source='name', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'product_name', 'sku', 'price', 'description',
            'stock_qty', 'image_url', 'category', 'category_name', 'owner',
        )

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be greater than zero.')
        return value

    def validate_stock_qty(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ('product', 'product_name', 'quantity', 'unit_price')
        read_only_fields = ('unit_price',)

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Quantity must be greater than zero.')
        return value


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('amount', 'method', 'status', 'paid_at')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    customer_id = serializers.IntegerField(source='user_id', read_only=True)
    payment_method = serializers.ChoiceField(choices=Payment.METHODS, write_only=True)
    payment = PaymentSerializer(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'customer_id', 'order_date', 'status', 'delivery_address', 'total_amount',
            'items', 'payment_method', 'payment',
        )
        read_only_fields = ('id', 'order_date', 'status', 'total_amount')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if request and getattr(request.user, 'role', None) == 'warehouse':
            data.pop('payment', None)
            data.pop('customer_id', None)
        return data

    def validate(self, attrs):
        items = attrs.get('items', [])
        if not items:
            raise serializers.ValidationError({'items': 'An order must contain at least one product.'})
        product_ids = [item['product'].id for item in items]
        if len(product_ids) != len(set(product_ids)):
            raise serializers.ValidationError({'items': 'Each product may appear only once in an order.'})
        address = attrs.get('delivery_address', '').strip()
        if not address:
            raise serializers.ValidationError({'delivery_address': 'Delivery address is required.'})
        attrs['delivery_address'] = address
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        payment_method = validated_data.pop('payment_method')
        request = self.context['request']
        order = Order.objects.create(user=request.user, **validated_data)
        total = 0
        maximum_total = Decimal('99999999.99')

        for item_data in items_data:
            product = item_data['product']
            quantity = item_data['quantity']
            updated = Product.objects.filter(
                pk=product.pk,
                stock_qty__gte=quantity,
            ).update(stock_qty=F('stock_qty') - quantity)
            if updated != 1:
                available = Product.objects.get(pk=product.pk).stock_qty
                raise serializers.ValidationError({
                    'items': f'Not enough stock for {product.name}. Available: {available}.'
                })

            product.refresh_from_db(fields=('price',))
            line_total = product.price * quantity
            total += line_total
            if total > maximum_total:
                raise serializers.ValidationError({
                    'items': 'The order total exceeds the allowed amount.'
                })
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price,
            )

        order.total_amount = total
        order.save(update_fields=('total_amount',))
        Payment.objects.create(order=order, amount=total, method=payment_method)
        return order
