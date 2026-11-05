from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Order, Payment, Product


User = get_user_model()


class StoreTransactionTests(TestCase):
    def setUp(self):
        self.buyer = User.objects.create_user(
            email='buyer@example.com',
            password='test-password',
            role='buyer',
            address='1 Main Street',
        )
        self.manager = User.objects.create_user(
            email='manager@example.com',
            password='test-password',
            role='manager',
            address='2 Main Street',
        )
        self.warehouse = User.objects.create_user(
            email='warehouse@example.com',
            password='test-password',
            role='warehouse',
            address='3 Main Street',
        )
        self.category = Category.objects.create(name='Audio', description='Sound equipment')
        self.product = Product.objects.create(
            name='Headphones',
            price='120.50',
            description='Wireless headphones',
            stock_qty=5,
            category=self.category,
        )
        self.client = APIClient()

    def order_payload(self, quantity=2):
        return {
            'delivery_address': '10 Shop Street, Astana',
            'payment_method': 'card',
            'items': [{'product': self.product.id, 'quantity': quantity}],
        }

    def test_order_decrements_stock_and_saves_payment_snapshot(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post('/api/orders/', self.order_payload(), format='json')

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 3)
        self.assertEqual(response.data['total_amount'], '241.00')
        self.assertEqual(response.data['items'][0]['unit_price'], '120.50')
        self.assertEqual(response.data['payment']['status'], 'Pending')
        self.assertEqual(response.data['payment']['amount'], '241.00')
        self.product.price = '999.00'
        self.product.save(update_fields=('price',))
        order = Order.objects.get(pk=response.data['id'])
        self.assertEqual(order.total_amount, Decimal('241.00'))
        self.assertEqual(order.items.get().unit_price, Decimal('120.50'))

    def test_insufficient_stock_rolls_back_order_and_inventory(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post('/api/orders/', self.order_payload(quantity=6), format='json')

        self.assertEqual(response.status_code, 400)
        self.assertEqual(Order.objects.count(), 0)
        self.assertEqual(Payment.objects.count(), 0)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 5)

    def test_customer_cancellation_restores_reserved_stock(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.post('/api/orders/', self.order_payload(quantity=2), format='json')
        order_id = response.data['id']

        cancel_response = self.client.delete(f'/api/orders/{order_id}/')

        self.assertEqual(cancel_response.status_code, 204)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 5)
        order = Order.objects.get(pk=order_id)
        self.assertEqual(order.status, 'Cancelled')
        self.assertEqual(order.payment.status, 'Failed')
        repeated_cancel = self.client.delete(f'/api/orders/{order_id}/')
        self.assertEqual(repeated_cancel.status_code, 400)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 5)

    def test_manager_can_mark_order_paid_and_get_sales_report(self):
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post('/api/orders/', self.order_payload(), format='json')
        order_id = create_response.data['id']

        self.client.force_authenticate(self.manager)
        status_response = self.client.patch(
            f'/api/orders/{order_id}/',
            {'status': 'Paid'},
            format='json',
        )
        report_response = self.client.get('/api/reports/sales/')

        self.assertEqual(status_response.status_code, 200)
        self.assertEqual(status_response.data['payment']['status'], 'Paid')
        self.assertEqual(len(report_response.data), 1)
        self.assertEqual(report_response.data[0]['units_sold'], 2)
        self.assertEqual(report_response.data[0]['revenue'], Decimal('241.00'))
        self.assertEqual(report_response.data[0]['stock_qty'], 3)

    def test_cash_on_delivery_is_marked_paid_when_delivered(self):
        self.client.force_authenticate(self.buyer)
        payload = self.order_payload(quantity=1)
        payload['payment_method'] = 'cash_on_delivery'
        create_response = self.client.post('/api/orders/', payload, format='json')
        order_id = create_response.data['id']

        self.client.force_authenticate(self.manager)
        shipped = self.client.patch(
            f'/api/orders/{order_id}/',
            {'status': 'Shipped'},
            format='json',
        )
        self.assertEqual(shipped.status_code, 200)
        self.assertEqual(shipped.data['payment']['status'], 'Pending')

        delivered = self.client.patch(
            f'/api/orders/{order_id}/',
            {'status': 'Delivered'},
            format='json',
        )
        self.assertEqual(delivered.status_code, 200)
        self.assertEqual(delivered.data['payment']['status'], 'Paid')
        self.assertIsNotNone(delivered.data['payment']['paid_at'])

    def test_only_warehouse_can_update_stock(self):
        self.client.force_authenticate(self.buyer)
        forbidden_response = self.client.patch(
            f'/api/products/{self.product.id}/stock/',
            {'stock_qty': 8},
            format='json',
        )
        self.assertEqual(forbidden_response.status_code, 403)

        self.client.force_authenticate(self.warehouse)
        update_response = self.client.patch(
            f'/api/products/{self.product.id}/stock/',
            {'stock_qty': 8},
            format='json',
        )
        self.assertEqual(update_response.status_code, 200)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 8)

    def test_non_customer_cannot_place_orders(self):
        self.client.force_authenticate(self.manager)
        response = self.client.post('/api/orders/', self.order_payload(), format='json')
        self.assertEqual(response.status_code, 403)

    def test_seller_can_place_customer_order(self):
        seller = User.objects.create_user(
            email='seller@example.com',
            password='test-password',
            role='seller',
        )
        self.client.force_authenticate(seller)
        response = self.client.post('/api/orders/', self.order_payload(), format='json')

        self.assertEqual(response.status_code, 201)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_qty, 3)

    def test_warehouse_order_view_does_not_expose_payment_records(self):
        self.client.force_authenticate(self.buyer)
        self.client.post('/api/orders/', self.order_payload(), format='json')
        self.client.force_authenticate(self.warehouse)

        response = self.client.get('/api/orders/')

        self.assertEqual(response.status_code, 200)
        self.assertNotIn('payment', response.data[0])
        self.assertNotIn('customer_id', response.data[0])
        self.assertEqual(response.data[0]['delivery_address'], '10 Shop Street, Astana')

    def test_registration_cannot_grant_staff_roles(self):
        response = self.client.post('/api/registration/', {
            'email': 'new-manager@example.com',
            'password': 'test-password',
            'first_name': 'New',
            'last_name': 'Manager',
            'role': 'manager',
            'address': '4 Main Street',
        }, format='json')

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(email='new-manager@example.com').exists())

    def test_customer_cannot_read_another_customers_order(self):
        self.client.force_authenticate(self.buyer)
        create_response = self.client.post('/api/orders/', self.order_payload(), format='json')
        other_buyer = User.objects.create_user(
            email='other@example.com',
            password='test-password',
            role='buyer',
            address='5 Main Street',
        )
        self.client.force_authenticate(other_buyer)

        response = self.client.get(f"/api/orders/{create_response.data['id']}/")

        self.assertEqual(response.status_code, 404)

    def test_customer_can_edit_own_profile_but_not_role(self):
        self.client.force_authenticate(self.buyer)
        response = self.client.patch('/api/me/', {
            'first_name': 'Updated',
            'address': '22 Updated Street',
        }, format='json')

        self.assertEqual(response.status_code, 200)
        self.buyer.refresh_from_db()
        self.assertEqual(self.buyer.first_name, 'Updated')
        self.assertEqual(self.buyer.address, '22 Updated Street')

        forbidden_response = self.client.patch('/api/me/', {'role': 'manager'}, format='json')
        self.assertEqual(forbidden_response.status_code, 400)
        self.buyer.refresh_from_db()
        self.assertEqual(self.buyer.role, 'buyer')
