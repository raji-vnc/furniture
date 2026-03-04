from rest_framework.viewsets import ModelViewSet
from .serializers import CartItemSerializer
from cart.models import CartItem

class CartItemViewSet(ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer