from rest_framework.viewsets import ModelViewSet
from .serializers import PaymentSerializer
from orders.models import Payment
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response

class PaymentViewSet(ModelViewSet):
    queryset=Payment.objects.all()
    serializer_class=PaymentSerializer
    permission_classes=[IsAuthenticated]

@api_view(['GET','POST'])
def payment_create(request):
    if request.method=='GET':
        payments=Payment.objects.all()
        serializer=PaymentSerializer(payments,many=True)
        return Response(serializer.data)
        
    if request.method =='POST':
        serializer=PaymentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
            "message":"Payment Successfull",
            "data":serializer.data
        })
        return Response(serializer.data)


