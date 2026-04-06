from rest_framework.viewsets import ModelViewSet
from .serializers import PaymentSerializer
from orders.models import Order, Payment
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
import stripe
from rest_framework import status
from django.conf import settings
from django.urls import reverse
from django.db import transaction

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentViewSet(ModelViewSet):
    queryset=Payment.objects.all()
    serializer_class=PaymentSerializer
    permission_classes=[IsAuthenticated]

@api_view(['GET'])
def payment_view(request):
    if request.method=='GET':
        payments=Payment.objects.all()
        serializer=PaymentSerializer(payments,many=True)
        return Response(serializer.data)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payment_create(request):
    try:
        amount = float(request.data.get('amount', 0))
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"error": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        amount_in_cents = max(int(amount * 100), 100)
        success_url = request.build_absolute_uri(
            reverse('products:thankyou')
        ) + f"?order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = request.build_absolute_uri(reverse('products:payment'))

        session=stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': 'Furni Order Payment',
                        },
                        'unit_amount': amount_in_cents,
                    },
                    'quantity': 1,
                }
            ],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "order_id": str(order.id),
                "user_id": str(request.user.id),
            },
        )
        return Response({
            "checkout_url": session.url
        })
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def payment_confirm(request):
    order_id = request.data.get('order_id')
    session_id = request.data.get('session_id') or ""

    if not order_id:
        return Response({"error": "order_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    order = Order.objects.filter(id=order_id, user=request.user).first()
    if not order:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

    order.status = 'PAID'
    order.save(update_fields=['status'])

    Payment.objects.update_or_create(
        order_id=str(order.id),
        defaults={
            "user": request.user,
            "payment_id": session_id or f"manual-order-{order.id}",
            "amount": float(order.total_amount),
            "status": "PAID",
        },
    )

    return Response({
        "message": "Payment confirmed.",
        "order_id": order.id,
        "status": order.status,
    })
    
@api_view(['PUT','DELETE'])
def payment_update_delete(request,pk):
    try:
        payment=Payment.objects.get(pk=pk)
    except Payment.DoesNotExist:
        return Response({"error":'Payment not found'},status=404)

    if request.method=='PUT':
        serializer= PaymentSerializer(payment, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        payment.delete()
        return Response({"message": "Payment deleted successfully"}, status=204)

  


