from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, place_order
from django.urls import path
router = DefaultRouter()    
router.register(r'orders', OrderViewSet, basename='order')
urlpatterns = [
    path('place/', place_order, name='place_order'),
]
urlpatterns += router.urls
