from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from cart.models import Cart, CartItem
from orders.models import BillingDetails, Order, OrderItem
from products.models import Product


class PlaceOrderTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="buyer", password="pass12345")
        self.product = Product.objects.create(name="Desk", price=Decimal("120.00"))
        self.cart = Cart.objects.create(user=self.user)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    def test_place_order_creates_order_and_clears_cart(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("place_order"),
            data={
                "country": "India",
                "state": "Kerala",
                "first_name": "Asha",
                "last_name": "K",
                "company_name": "Demo Co",
                "address": "Main street",
                "zip_code": "682001",
                "email": "asha@example.com",
                "phone": "9999999999",
                "order_notes": "Please call before delivery",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(OrderItem.objects.count(), 1)
        self.assertEqual(BillingDetails.objects.count(), 1)

        order = Order.objects.get()
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.total_amount, Decimal("240.00"))
        self.assertEqual(order.items.first().quantity, 2)
        self.assertEqual(self.cart.items.count(), 0)

    def test_order_list_only_returns_logged_in_users_orders(self):
        other_user = User.objects.create_user(username="otherbuyer", password="pass12345")
        Order.objects.create(user=other_user, total_amount=Decimal("75.00"), status="PENDING")
        own_order = Order.objects.create(user=self.user, total_amount=Decimal("240.00"), status="PENDING")

        self.client.force_login(self.user)
        response = self.client.get(reverse("order-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["id"], own_order.id)

    def test_order_detail_includes_item_summary_for_payment_page(self):
        order = Order.objects.create(user=self.user, total_amount=Decimal("240.00"), status="PENDING")
        OrderItem.objects.create(order=order, product=self.product, quantity=2, price=Decimal("120.00"))

        self.client.force_login(self.user)
        response = self.client.get(reverse("order-detail", args=[order.id]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["id"], order.id)
        self.assertEqual(payload["items"][0]["product_name"], self.product.name)
        self.assertEqual(payload["items"][0]["line_total"], "240.00")
