from django.shortcuts import render
from cart.models import Cart,CartItem

# Create your views here.
# def cart_view(request):
#     cart_items = CartItem.objects.filter(cart__user=request.user)
#     return render(request, 'cart.html', {'cart_items': cart_items})

def cart_view(request):
    if request.user.is_authenticated:
        cart_items = Cart.objects.filter(user=request.user)
    else:
        cart_items = request.session.get('cart', {})
        print(request.user)

    return render(request, 'cart.html', {
        'cart_items': cart_items
    })
