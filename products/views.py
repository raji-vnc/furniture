from django.shortcuts import render
from cart.models import CartItem

def index(request):
    return render(request,'index.html')

def products(request):
    return render(request,'shop.html')

def checkout(request):
    return render(request,'checkout.html')
def payment(request):
    return render(request,'payment_success.html')



