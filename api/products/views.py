from .serializers import ProductSerializer
from products.models import Product
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes=[AllowAny]