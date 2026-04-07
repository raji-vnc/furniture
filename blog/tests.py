from django.test import TestCase
from django.urls import reverse

from blog.models import Blog


class BlogApiTests(TestCase):
    def test_blog_api_returns_posts(self):
        Blog.objects.create(
            title="Furniture Care Guide",
            author="Furni Team",
            content="Clean wooden furniture with a soft dry cloth.",
        )

        response = self.client.get(reverse("blog-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
