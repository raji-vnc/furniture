from rest_framework.routers import DefaultRouter
from .views import payment_create,PaymentViewSet
from django.urls import path
router = DefaultRouter()    
router.register(r'payments',PaymentViewSet,basename='payments')
urlpatterns = router.urls




urlpatterns=[
    path('payment/',payment_create)
]