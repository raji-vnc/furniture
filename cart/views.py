from django.shortcuts import render

from cart.models import Cart, CartItem

# Create your views here.
# def cart_view(request):
#     cart_items = CartItem.objects.filter(cart__user=request.user)
#     return render(request, 'cart.html', {'cart_items': cart_items})

def get_current_cart(request):
    if request.user.is_authenticated:
        return Cart.objects.filter(user=request.user).first()

    session_key = request.session.session_key
    if not session_key:
        return None

    return Cart.objects.filter(session_key=session_key, user__isnull=True).first()


def cart_view(request):
    cart = get_current_cart(request)
    cart_items = CartItem.objects.filter(cart=cart).select_related("product") if cart else CartItem.objects.none()

    return render(
        request,
        "cart.html",
        {
            "cart_items": cart_items,
        },
    )
