from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase
from django.urls import reverse

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
        self.assertEqual(Payment.objects.count(), 1)
        self.assertEqual(Payment.objects.first().payment_id, "cs_test_123")
