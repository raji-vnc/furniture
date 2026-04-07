from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from cart.models import Cart, CartItem
from orders.models import Order, OrderItem
from products.models import Product


class LoginCartMergeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="alice", password="pass12345")
        self.product = Product.objects.create(name="Sofa", price=Decimal("199.99"))

    def test_login_merges_guest_cart_into_user_cart(self):
        add_response = self.client.post(
            reverse("cart-add"),
            data={"product_id": self.product.id, "quantity": 2},
            content_type="application/json",
        )
        self.assertEqual(add_response.status_code, 200)

        guest_cart = Cart.objects.get(user__isnull=True)
        self.assertEqual(guest_cart.items.count(), 1)

        login_response = self.client.post(
            reverse("login_api"),
            data={"username": "alice", "password": "pass12345"},
            content_type="application/json",
        )
        self.assertEqual(login_response.status_code, 200)

        user_cart = Cart.objects.get(user=self.user)
        self.assertEqual(user_cart.items.count(), 1)
        self.assertEqual(user_cart.items.first().quantity, 2)
        self.assertFalse(Cart.objects.filter(pk=guest_cart.pk).exists())

    def test_profile_page_shows_users_previous_orders(self):
        order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("399.98"),
            status="PENDING",
            payment_method="COD",
        )
        OrderItem.objects.create(order=order, product=self.product, quantity=2, price=Decimal("199.99"))

        self.client.force_login(self.user)
        response = self.client.get(reverse("accounts:profile"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, f"Order #{order.id}")
        self.assertContains(response, self.product.name)
        self.assertContains(response, "Cash on Delivery")
        self.assertContains(response, f'{reverse("products:payment")}?order_id={order.id}')
