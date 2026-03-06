from typing import Required

from rest_framework import serializers
from orders.models import Order,BillingDetails,OrderItem


class BillingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model=BillingDetails
        exclude=['order']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model=OrderItem
        exclude=['order']

class OrderSerializer(serializers.ModelSerializer):
    billing_details=BillingDetailsSerializer(required=False)
    items=OrderItemSerializer(many=True,required=False)
    
    class Meta:
        model=Order
        fields='__all__'

    def create(self,validated_data):
        billing_data=validated_data.pop('billing_details')
        items_data=validated_data.pop('items')
        order=Order.objects.create(**validated_data)
        BillingDetails.objects.create(order=order,** billing_data)
        for item in items_data:
            OrderItem.objects.create(order=order,**item)
            return order

