from rest_framework.viewsets import ModelViewSet
from .serializers import OrderSerializer,PaymentSerializer
from orders.models import Order,Payment
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

class OrderViewSet(ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes=[IsAuthenticated]

class PaymentViewSet(ModelViewSet):
    queryset=Payment.objects.all()
    serializer_class=PaymentSerializer
    permission_classes=[IsAuthenticated]
    
@api_view(['POST'])
def payment_create(request):
    serializer=PaymentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({
            "message":"Payment Successfull",
            "data":serializer.data
        })
    return Response(serializer.data)


