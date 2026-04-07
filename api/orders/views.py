from decimal import Decimal

from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction

from .serializers import OrderSerializer
from cart.models import Cart
from orders.models import BillingDetails, Order, OrderItem

class OrderViewSet(ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .select_related("billing_details")
            .prefetch_related("items__product")
        )

def get_user_cart(request):
    return (
        Cart.objects.filter(user=request.user)
        .prefetch_related("items__product")
        .first()
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def place_order(request):
    cart = get_user_cart(request)
    if not cart or not cart.items.exists():
        return Response(
            {"error": "Your cart is empty."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    cart_items = list(cart.items.select_related("product").all())
    total_amount = sum(
        (item.product.price * item.quantity for item in cart_items),
        Decimal("0.00"),
    )

    order = Order.objects.create(
        user=request.user,
        total_amount=total_amount,
        status="PENDING",
    )

    BillingDetails.objects.create(
        order=order,
        country=request.data.get("country") or "Not provided",
        state=request.data.get("state") or "",
        first_name=request.data.get("first_name") or request.user.first_name or request.user.username,
        last_name=request.data.get("last_name") or request.user.last_name or "",
        company_name=request.data.get("company_name") or "",
        address=request.data.get("address") or "",
        zip_code=request.data.get("zip_code") or "",
        email=request.data.get("email") or request.user.email or "",
        phone=request.data.get("phone") or "",
        order_notes=request.data.get("order_notes") or "",
    )

    order_items = [
        OrderItem(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.product.price,
        )
        for item in cart_items
    ]
    OrderItem.objects.bulk_create(order_items)

    cart.items.all().delete()

    return Response(
        {
            "message": "Order placed successfully.",
            "order_id": order.id,
            "total_amount": str(order.total_amount),
            "status": order.status,
        },
        status=status.HTTP_201_CREATED,
    )


