from rest_framework.routers import DefaultRouter
from .views import OrderViewSet,payment_create,PaymentViewSet
from django.urls import path
router = DefaultRouter()    
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments',PaymentViewSet,basename='payments')
urlpatterns = router.urls

urlpatterns=[
    path('payment/',payment_create)
]