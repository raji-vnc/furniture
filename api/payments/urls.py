from rest_framework.routers import DefaultRouter
from .views import payment_update_delete, payment_view, PaymentViewSet, payment_create, payment_confirm
from django.urls import path
router = DefaultRouter()    
router.register(r'payments',PaymentViewSet,basename='payments')
urlpatterns = router.urls




urlpatterns=[
    path('payment/', payment_view, name='payment_view'),
    path('payment-create/', payment_create, name='payment_create'),
    path('payment-confirm/', payment_confirm, name='payment_confirm'),
    path('payment-update-delete/<int:pk>/', payment_update_delete, name='payment_update_delete'),
]
