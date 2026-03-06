from rest_framework.viewsets import ModelViewSet
from .serializers import OrderSerializer
from orders.models import Order
from rest_framework.permissions import IsAuthenticated

class OrderViewSet(ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes=[IsAuthenticated]