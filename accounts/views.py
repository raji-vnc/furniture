from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

# Create your views here.

@ensure_csrf_cookie
def signup(request):
    return render(request,'signup.html')

@ensure_csrf_cookie
def signin(request):
    return render(request,'signin.html')

def home(request):
    return render(request,'index.html')
