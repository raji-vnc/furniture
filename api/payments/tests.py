from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse
from unittest.mock import patch

from orders.models import Order, Payment


class PaymentConfirmTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="payer", password="pass12345")
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("150.00"),
            status="PENDING",
        )

    def test_payment_confirm_marks_order_paid_and_creates_payment(self):
        self.client.force_login(self.user)

        response = self.client.post(
            "/api/payments/payment-confirm/",
            data={
                "order_id": self.order.id,
                "session_id": "cs_test_123",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "PAID")
        self.assertEqual(self.order.payment_method, "CARD")
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().payment_id, "cs_test_123")

    def test_payment_confirm_keeps_cash_on_delivery_order_pending(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("payment_confirm"),
            data={
                "order_id": self.order.id,
                "payment_method": "cod",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)

        self.order.refresh_from_db()
        self.assertEqual(self.order.status, "PENDING")
        self.assertEqual(self.order.payment_method, "COD")
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().status, "PAY_ON_DELIVERY")

    @patch("api.payments.views.stripe.checkout.Session.create")
    @patch("api.payments.views.settings.STRIPE_SECRET_KEY", "sk_test_123")
    def test_payment_create_creates_initiated_payment_record(self, mock_stripe_create):
        self.client.force_login(self.user)
        mock_stripe_create.return_value = type(
            "StripeSession",
            (),
            {"id": "cs_test_init_123", "url": "https://checkout.stripe.test/session"},
        )()

        response = self.client.post(
            reverse("payment_create"),
            data={
                "order_id": self.order.id,
                "amount": "150.00",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["checkout_url"], "https://checkout.stripe.test/session")
        self.order.refresh_from_db()
        self.assertEqual(self.order.payment_method, "CARD")
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().payment_id, "cs_test_init_123")
        self.assertEqual(Payment.objects.first().status, "INITIATED")

    @patch("api.payments.views.settings.STRIPE_SECRET_KEY", None)
    def test_payment_create_returns_helpful_error_when_stripe_not_configured(self):
        self.client.force_login(self.user)

        response = self.client.post(
            reverse("payment_create"),
            data={
                "order_id": self.order.id,
                "amount": "150.00",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertIn("Stripe is not configured", response.json()["error"])


class PaymentAdminTests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123",
        )
        self.user = User.objects.create_user(username="payer2", password="pass12345")
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal("210.00"),
            status="PENDING",
            payment_method="COD",
        )
        Payment.objects.create(
            user=self.user,
            order_id=str(self.order.id),
            payment_id="cod-order-test",
            amount=210.0,
            status="PAY_ON_DELIVERY",
        )

    def test_payment_admin_changelist_loads_with_order_details(self):
        self.client.force_login(self.admin_user)
        response = self.client.get(reverse("admin:orders_payment_changelist"))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Cash on Delivery")
        self.assertContains(response, "Pending")
