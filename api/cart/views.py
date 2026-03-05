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

@api_view(['GET'])
def view_cart(request):
    user=request.user
    try:
        cart=Cart.objects.get(user=user)
    except Cart.DoesNotExist:
        return Response({"message":"Cart is empty"})
    

    cartitems=CartItem.objects.filter(cart=cart)
    data=[]
    total_price=0
    for item in cartitems:
        item_total=item.product.price * item.quantity
        total_price +=item_total

        data.append({
            "product_id":item.product.id,
            "product_name":item.product.name,
            "price":item.product.price,
            "quantity":item.quantity,
            "total":item_total
        })
        return Response({
            "cart_items":data,
            "cart_total":total_price
        })

@api_view(['DELETE'])
def remove_cart_item(request):
    cart_item_id=request.data.get("cart_item_id")
    try:
        cartitem=CartItem.objects.get(id=cart_item_id)
    except CartItem.DoesNotExist:
        return Response({"error":"Cart item not found"})
    cartitem.delete()
    return Response({"message":"cart item removed"})

@api_view(['PUT'])
def update_cart(request):
    cart_item_id=request.data.get("cart_item_id")
    quantity=request.data.get('quantity')

    try:
        cart_item=CartItem.objects.get(id=cart_item_id)

    except CartItem.DoesNotExist:
        return Response({"error":"cart item not found"})
    if int(quantity) <=0:
        cart_item.delete()
        return Response({"message":"item removed from cart"})
    cart_item.quantity=quantity
    cart_item.save()

    return Response({
        "message":"cart updated successfully",
        "product":cart_item.product.name,
        "quantity":cart_item.quantity
    })

