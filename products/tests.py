from django.test import TestCase
from django.urls import reverse


class ContentPageTests(TestCase):
    def test_services_page_renders(self):
        response = self.client.get(reverse("products:services"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "services-testimonials")

    def test_blog_page_renders(self):
        response = self.client.get(reverse("products:blog"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "blog-list")

    def test_contact_page_renders(self):
        response = self.client.get(reverse("products:contact"))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "contact-form")
