from django import views
from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import add_to_cart,view_cart,remove_cart_item,update_cart
from .views import CartItemViewSet
router = DefaultRouter()
router.register(r'cart-items', CartItemViewSet, basename='cartitem')
urlpatterns = router.urls

urlpatterns=[
    path('add/',add_to_cart),
    path('view/',view_cart),
    path('remove/',remove_cart_item),
    path('update/',update_cart)

]