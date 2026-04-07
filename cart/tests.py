from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

from cart.models import Cart, CartItem
from products.models import Product


class CartFlowTests(TestCase):
    def setUp(self):
        self.product = Product.objects.create(name="Chair", price=Decimal("99.99"))

    def test_add_to_cart_creates_cart_item_for_guest(self):
        response = self.client.post(
            reverse("cart-add"),
            data={"product_id": self.product.id, "quantity": 2},
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(Cart.objects.count(), 1)
        self.assertEqual(CartItem.objects.count(), 1)

        cart_item = CartItem.objects.select_related("product", "cart").get()
        self.assertEqual(cart_item.product, self.product)
        self.assertEqual(cart_item.quantity, 2)
        self.assertIsNotNone(cart_item.cart.session_key)

    def test_cart_page_uses_database_cart_items_for_logged_in_user(self):
        user = User.objects.create_user(username="cartuser", password="pass12345")
        cart = Cart.objects.create(user=user)
        CartItem.objects.create(cart=cart, product=self.product, quantity=1)

        self.client.force_login(user)
        response = self.client.get(reverse("cart:cart_view"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(list(response.context["cart_items"]), [cart.items.get()])


class CartAdminTests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123",
        )
        self.product = Product.objects.create(name="Table", price=Decimal("49.50"))
        self.cart = Cart.objects.create()
        self.cart_item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)

    def test_cart_admin_changelist_loads(self):
        self.client.force_login(self.admin_user)
        response = self.client.get(reverse("admin:cart_cart_changelist"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Guest")

    def test_cart_item_admin_changelist_loads(self):
        self.client.force_login(self.admin_user)
        response = self.client.get(reverse("admin:cart_cartitem_changelist"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, self.product.name)
