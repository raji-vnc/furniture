from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from accounts.models import Profile
from orders.models import Order

# Create your views here.

@ensure_csrf_cookie
def signup(request):
    return render(request,'signup.html')

@ensure_csrf_cookie
def signin(request):
    return render(request,'signin.html')

def home(request):
    return render(request,'index.html')

@login_required(login_url='/accounts/signin/')
def profile(request):
    user_profile, _ = Profile.objects.get_or_create(user=request.user)
    orders = (
        Order.objects.filter(user=request.user)
        .prefetch_related("items__product")
        .order_by("-created_at")
    )
    return render(
        request,
        'profile.html',
        {
            'user_profile': user_profile,
            'orders': orders,
        },
    )
