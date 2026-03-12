from django import views
from django.urls import path
from products.views import index,products,cart,checkout,payment

app_name='products'
urlpatterns=[
    path('',index,name='index'),
    path('products/',products,name='products'),
    path('cart/',cart,name='cart'),
    path('checkout/',checkout,name='checkout'),
    path('payment/',payment,name='payment')
]