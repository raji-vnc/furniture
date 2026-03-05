from rest_framework.viewsets import ModelViewSet
from .serializers import CartItemSerializer
from cart.models import CartItem,Cart
from rest_framework.decorators import api_view 
from rest_framework.response import Response
from products.models import Product

class CartItemViewSet(ModelViewSet):
    queryset = CartItem.objects.all()
    serializer_class = CartItemSerializer


@api_view(['POST'])
def add_to_cart(request):
    user=request.user
    product_id=request.data.get("product_id")
    quantity=request.data.get("quantity",1)
    product=Product.objects.get(id=product_id)
    cart,created=Cart.objects.get_or_create(user=user)
    cartitem,created=CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not created:
        cartitem.quantity+=int(quantity)
        cart.save()

    return Response({"message":"Product added"})