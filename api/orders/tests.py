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
