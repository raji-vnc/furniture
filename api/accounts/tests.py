from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from cart.models import Cart, CartItem
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
