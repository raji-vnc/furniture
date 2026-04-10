from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CouponViewSet, apply_coupon, available_coupons

router = DefaultRouter()
router.register(r'coupons', CouponViewSet, basename='coupon')
urlpatterns = router.urls + [
    path("apply/", apply_coupon, name="coupon-apply"),
    path("available/", available_coupons, name="coupon-available"),
]
