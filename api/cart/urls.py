
from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import CartItemViewSet, add_to_cart, remove_from_cart

router = DefaultRouter()
router.register(r'cartitems', CartItemViewSet, basename='cartitem')

urlpatterns = [
    path('', include(router.urls)),                          
    path('add/', add_to_cart, name='cart-add'),              
    path('remove/<int:item_id>/', remove_from_cart, name='cart-remove'),  
]