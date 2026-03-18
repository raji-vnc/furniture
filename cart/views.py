from django.shortcuts import render
from cart.models import Cart,CartItem

# Create your views here.
def cart_view(request):
    cart_items = CartItem.objects.filter(cart__user=request.user)
    return render(request, 'cart.html', {'cart_items': cart_items})