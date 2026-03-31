from django import views
from django.urls import path
from products.views import  index,products,checkout,payment,thankyou

app_name='products'
urlpatterns=[
    path('',index,name='index'),
    path('products/',products,name='products'),
    path('checkout/',checkout,name='checkout'),
    path('payment/',payment,name='payment')
    ,path('thankyou/',thankyou,name='thankyou')
]
