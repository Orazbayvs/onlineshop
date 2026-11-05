from datetime import timedelta

from django.db import transaction
from django.db.models.deletion import ProtectedError
from django.db.models import DecimalField, F, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Order, OrderItem, Payment, Product, User
from .serializers import (
    CategorySerializer,
    OrderSerializer,
    ProductSerializer,
    ProfileSerializer,
    UserSerializer,
)


def has_role(user, *roles):
    return user.is_authenticated and user.role in roles


class IsSalesManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, 'manager')


class IsWarehouseStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_role(request.user, 'warehouse')


class CategoryList(APIView):
    def get(self, request):
        categories = Category.objects.filter(is_active=True)
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CategoryDetail(APIView):
    def get(self, request, id):
        category = get_object_or_404(Category, id=id, is_active=True)
        return Response(CategorySerializer(category).data)

    def put(self, request, id):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        category = get_object_or_404(Category, id=id)
        serializer = CategorySerializer(category, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, id):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        category = get_object_or_404(Category, id=id)
        category.is_active = False
        category.save(update_fields=('is_active',))
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryProducts(APIView):
    def get(self, request, id):
        category = get_object_or_404(Category, id=id, is_active=True)
        products = Product.objects.filter(category=category)
        return Response(ProductSerializer(products, many=True).data)


class ProductsList(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    filter_backends = []
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Product.objects.filter(category__is_active=True)
        category = self.request.query_params.get('category')
        search = self.request.query_params.get('search')
        ordering = self.request.query_params.get('ordering')
        if category:
            queryset = queryset.filter(category_id=category)
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(description__icontains=search)
        if ordering in ('price', '-price', 'name', '-name'):
            queryset = queryset.order_by(ordering)
        return queryset

    def create(self, request, *args, **kwargs):
        if not has_role(request.user, 'seller', 'manager'):
            raise PermissionDenied()
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ProductDetail(APIView):
    def get(self, request, id):
        product = get_object_or_404(Product, id=id, category__is_active=True)
        return Response(ProductSerializer(product).data)

    def put(self, request, id):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        if 'stock_qty' in request.data:
            raise ValidationError({'stock_qty': 'Use the warehouse stock endpoint to change inventory.'})
        product = get_object_or_404(Product, id=id)
        serializer = ProductSerializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, id):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        product = get_object_or_404(Product, id=id)
        try:
            product.delete()
        except ProtectedError:
            raise ValidationError('Products used in orders cannot be deleted.')
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductStock(APIView):
    permission_classes = [IsWarehouseStaff]

    def patch(self, request, id):
        raw_stock_qty = request.data.get('stock_qty')
        if isinstance(raw_stock_qty, bool) or not isinstance(raw_stock_qty, (int, str)):
            raise ValidationError({'stock_qty': 'A non-negative integer is required.'})
        if isinstance(raw_stock_qty, str) and not raw_stock_qty.isdigit():
            raise ValidationError({'stock_qty': 'A non-negative integer is required.'})
        stock_qty = int(raw_stock_qty)
        if stock_qty < 0:
            raise ValidationError({'stock_qty': 'Stock cannot be negative.'})
        product = get_object_or_404(Product, id=id)
        product.stock_qty = stock_qty
        product.save(update_fields=('stock_qty',))
        return Response(ProductSerializer(product).data)


class CurrentUser(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    def patch(self, request):
        editable_fields = {'email', 'first_name', 'last_name', 'phone', 'address'}
        unexpected_fields = set(request.data) - editable_fields
        if unexpected_fields:
            raise ValidationError({
                'detail': 'Only email, name, phone, and address can be edited in a profile.'
            })
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class UserList(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        return Response(UserSerializer(users, many=True).data)


class UserRegister(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UserOrders(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if has_role(request.user, 'manager', 'warehouse'):
            orders = Order.objects.prefetch_related('items', 'payment').all()
        else:
            orders = request.user.orders.prefetch_related('items', 'payment').all()
        return Response(OrderSerializer(orders, many=True, context={'request': request}).data)

    def post(self, request):
        if request.user.role not in ('buyer', 'seller'):
            raise PermissionDenied('This account is not permitted to place customer orders.')
        serializer = OrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(
            OrderSerializer(order, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetail(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request, id):
        orders = Order.objects.prefetch_related('items', 'payment')
        if has_role(request.user, 'manager', 'warehouse'):
            return get_object_or_404(orders, id=id)
        return get_object_or_404(orders, id=id, user_id=request.user.id)

    def get(self, request, id):
        return Response(OrderSerializer(
            self.get_object(request, id),
            context={'request': request},
        ).data)

    @transaction.atomic
    def patch(self, request, id):
        if not has_role(request.user, 'manager'):
            raise PermissionDenied()
        order = get_object_or_404(Order.objects.select_for_update().select_related('payment'), id=id)
        new_status = request.data.get('status')
        valid_statuses = dict(Order.STATUS_CHOICES)
        if new_status not in valid_statuses:
            raise ValidationError({'status': 'Choose a valid order status.'})

        allowed_transitions = {
            'New': {'Paid', 'Shipped', 'Cancelled'},
            'Paid': {'Shipped', 'Cancelled'},
            'Shipped': {'Delivered'},
            'Delivered': set(),
            'Cancelled': set(),
        }
        if new_status not in allowed_transitions[order.status]:
            raise ValidationError({'status': f'Cannot change {order.status} to {new_status}.'})

        payment = order.payment
        if (
            new_status == 'Shipped'
            and payment.method != 'cash_on_delivery'
            and payment.status != 'Paid'
        ):
            raise ValidationError({'status': 'Payment must be confirmed before shipment.'})
        if new_status == 'Cancelled':
            for item in order.items.select_related('product'):
                Product.objects.filter(pk=item.product_id).update(
                    stock_qty=F('stock_qty') + item.quantity
                )
            payment.status = 'Refunded' if payment.status == 'Paid' else 'Failed'
        elif new_status == 'Paid' or (
            new_status == 'Delivered'
            and payment.method == 'cash_on_delivery'
            and payment.status == 'Pending'
        ):
            payment.status = 'Paid'
            payment.paid_at = payment.paid_at or timezone.now()
        payment.save(update_fields=('status', 'paid_at'))
        order.status = new_status
        order.save(update_fields=('status',))
        return Response(OrderSerializer(order, context={'request': request}).data)

    @transaction.atomic
    def delete(self, request, id):
        order = get_object_or_404(
            Order.objects.select_for_update().select_related('payment'),
            id=id,
            user_id=request.user.id,
        )
        if order.status != 'New':
            raise ValidationError('Only new orders can be cancelled by the customer.')
        if order.status != 'New':
            raise ValidationError('Only new orders can be cancelled by the customer.')
        for item in order.items.all():
            Product.objects.filter(pk=item.product_id).update(
                stock_qty=F('stock_qty') + item.quantity
            )
        order.payment.status = 'Failed'
        order.payment.save(update_fields=('status',))
        order.status = 'Cancelled'
        order.save(update_fields=('status',))
        return Response(status=status.HTTP_204_NO_CONTENT)


class SalesReport(APIView):
    permission_classes = [IsSalesManager]

    def get(self, request):
        since = timezone.now() - timedelta(days=30)
        rows = (
            OrderItem.objects
            .filter(
                order__order_date__gte=since,
                order__status__in=('Paid', 'Shipped', 'Delivered'),
            )
            .values('product_id', 'product__name', 'product__stock_qty')
            .annotate(
                units_sold=Sum('quantity'),
                revenue=Sum(
                    F('quantity') * F('unit_price'),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
            )
            .order_by('-units_sold', 'product__name')[:5]
        )
        return Response([
            {
                'product_id': row['product_id'],
                'product_name': row['product__name'],
                'units_sold': row['units_sold'],
                'revenue': row['revenue'],
                'stock_qty': row['product__stock_qty'],
            }
            for row in rows
        ])
