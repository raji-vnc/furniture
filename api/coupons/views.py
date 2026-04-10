from datetime import date

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ModelViewSet

from .serializers import CouponSerializer
from coupons.models import Coupon

class CouponViewSet(ModelViewSet):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def apply_coupon(request):
    code = str(request.data.get("code", "")).strip()
    if not code:
        return Response({"detail": "Code is required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        coupon = Coupon.objects.get(code__iexact=code, active=True, expiry_date__gte=date.today())
    except Coupon.DoesNotExist:
        return Response({"detail": "Invalid or expired coupon"}, status=status.HTTP_404_NOT_FOUND)

    data = CouponSerializer(coupon).data
    return Response({"message": "Coupon applied", "coupon": data})


@api_view(["GET"])
@permission_classes([AllowAny])
def available_coupons(request):
    """Return active, non-expired coupons."""
    today = date.today()
    coupons = Coupon.objects.filter(active=True, expiry_date__gte=today).order_by("expiry_date")
    data = CouponSerializer(coupons, many=True).data
    return Response(data)
