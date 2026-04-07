from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def index(request):
    return render(request,'index.html')

def products(request):
    return render(request,'shop.html')

def about(request):
    return render(request,'about.html')

def services(request):
    return render(request, 'services.html')

def blog(request):
    return render(request, 'blog.html')

def contact(request):
    return render(request, 'contact.html')

@login_required(login_url='/accounts/signin/')
def checkout(request):
    return render(request,'checkout.html')

@login_required(login_url='/accounts/signin/')
def payment(request):
    return render(request,'payment_success.html')

@login_required(login_url='/accounts/signin/')
def thankyou(request):
    return render(request,'thankyou.html')



