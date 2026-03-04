from rest_framework import serializers
from orders.models import Order,BillingDetails,OrderItem


class BillingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model=BillingDetails
        fields='__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrderItem
        fields='__all__'

class OrderSerializer(serializers.ModelSerializer):
    billing_details=BillingDetailsSerializer()
    order_items=OrderItemSerializer(many=True)
    
    class Meta:
        model=Order
        fields='__all__'

