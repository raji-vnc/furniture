# cart/views.py

from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.shortcuts import get_object_or_404

from cart.models import Cart, CartItem
from .serializers import CartItemSerializer
from products.models import Product


# ============================================================
#  Helper — get or create cart (works for guests + logged-in)
# ============================================================
# ✅ FIX
def get_cart(request):
    if request.user.is_authenticated:
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return cart
    # Guest: use session key
    if not request.session.session_key:
        request.session.create()
    session_key = request.session.session_key
    cart, _ = Cart.objects.get_or_create(session_key=session_key, user=None)
    return cart

# ============================================================
#  ViewSet — GET /api/cart-items/
# ============================================================
# ✅ FIX — indent it inside the class
class CartItemViewSet(ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        cart = get_cart(self.request)
        return CartItem.objects.filter(cart=cart).select_related('product')

    def partial_update(self, request, *args, **kwargs):  # ← indented inside class
        instance = self.get_object()
        qty = int(request.data.get('quantity', instance.quantity))
        if qty < 1:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        instance.quantity = qty
        instance.save()
        return Response(self.get_serializer(instance).data)

# ============================================================
#  POST /api/cart/add/
# ============================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def add_to_cart(request):
    """
    Body: { "product_id": 5, "quantity": 1 }
    """
    product_id = request.data.get('product_id')
    quantity   = int(request.data.get('quantity', 1))

    if not product_id:
        return Response({'error': 'product_id is required.'}, status=400)

    product = get_object_or_404(Product, id=product_id)
    cart    = get_cart(request)

    cart_item, created = CartItem.objects.create(
        user=request.user,
        product=product,
        quantity=1,
        defaults={'quantity': quantity}
    )
    if not created:
        cart_item.quantity += quantity
        cart_item.save()

    cart_total = sum(
        float(i.product.price) * i.quantity
        for i in cart.items.select_related('product').all()
    )

    return Response({
        'message': f'"{product.name}" added to cart.',
        'created': created,
        'cart_item': CartItemSerializer(cart_item, context={'request': request}).data,
        'cart_total': round(cart_total, 2),
        'cart_count': cart.items.count(),
    }, status=200)


# ============================================================
#  DELETE /api/cart/remove/<item_id>/
# ============================================================
@api_view(['DELETE'])
@permission_classes([AllowAny])
def remove_from_cart(request, item_id):
    cart = get_cart(request)
    item = get_object_or_404(CartItem, id=item_id, cart=cart)
    item.delete()
    return Response({'message': 'Item removed.'}, status=204)