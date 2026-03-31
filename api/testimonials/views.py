from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet

from .serializers import TestimonialSerializer
from testimonials.models import Testimonial


class TestimonialViewSet(ModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
    permission_classes = [AllowAny]
