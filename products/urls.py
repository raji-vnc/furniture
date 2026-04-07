from django import views
from django.urls import path
from products.views import about, index, products, services, blog, contact, checkout, payment, thankyou

app_name='products'
urlpatterns=[
    path('',index,name='index'),
    path('products/',products,name='products'),
    path('about/', about, name='about'),
    path('services/', services, name='services'),
    path('blog/', blog, name='blog'),
    path('contact/', contact, name='contact'),
    path('checkout/',checkout,name='checkout'),
    path('payment/',payment,name='payment')
    ,path('thankyou/',thankyou,name='thankyou')
]
