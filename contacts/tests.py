from django.test import TestCase
from django.urls import reverse

from contacts.models import Contact


class ContactApiTests(TestCase):
    def test_contact_api_creates_message(self):
        response = self.client.post(
            reverse("contact-list"),
            data={
                "firstname": "Asha",
                "lastname": "K",
                "email": "asha@example.com",
                "message": "Need help with a custom sofa.",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Contact.objects.count(), 1)
