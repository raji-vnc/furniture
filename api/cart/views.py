from rest_framework.viewsets import ModelViewSet
from .serializers import CartItemSerializer
from cart.models import CartItem,Cart
from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from products.models import Product
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework import status

class CartItemViewSet(ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

@api_view(['POST'])
def add_to_cart(request):
    user = request.user
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    cart_item, created = Cart.objects.get_or_create(
        user=user,
        product=product
    )

    if not created:
        cart_item.quantity += int(quantity)
    else:
        cart_item.quantity = quantity

    cart_item.save()

    return Response({
        "message": "Product added to cart",
        "product": product.name,
        "quantity": cart_item.quantity
    }, status=status.HTTP_200_OK)
