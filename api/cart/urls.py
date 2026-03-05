from django import views
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import add_to_cart
from .views import CartItemViewSet
router = DefaultRouter()
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
urlpatterns = router.urls

urlpatterns=[
    path('add/',add_to_cart)
]