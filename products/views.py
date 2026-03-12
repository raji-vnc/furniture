from django.shortcuts import render

def index(request):
    return render(request,'index.html')

def products(request):
    return render(request,'shop.html')
def cart(request):
    return render(request,'cart.html')
def checkout(request):
    return render(request,'checkout.html')
def payment(request):
    return render(request,'payment_success.html')



