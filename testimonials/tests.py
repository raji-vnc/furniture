from django.test import TestCase
from django.urls import reverse

from testimonials.models import Testimonial


class TestimonialApiTests(TestCase):
    def test_testimonial_api_returns_entries(self):
        Testimonial.objects.create(
            name="Riya",
            feedback="Great service and delivery.",
            position="Customer",
        )

        response = self.client.get(reverse("testimonial-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
