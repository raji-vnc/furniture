from rest_framework.viewsets import ModelViewSet
from .serializers import CouponSerializer
from coupons.models import Coupon

class CouponViewSet(ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer