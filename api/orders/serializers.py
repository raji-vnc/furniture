from rest_framework import serializers

from orders.models import BillingDetails, Order, OrderItem


class BillingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingDetails
        exclude = ["order"]


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        exclude = ["order"]

    def get_line_total(self, obj):
        return f"{obj.total_price():.2f}"


class OrderSerializer(serializers.ModelSerializer):
    billing_details = BillingDetailsSerializer(required=False)
    items = OrderItemSerializer(many=True, required=False)

    class Meta:
        model = Order
        fields = "__all__"

    def create(self, validated_data):
        billing_data = validated_data.pop("billing_details", None)
        items_data = validated_data.pop("items", [])

        order = Order.objects.create(**validated_data)

        if billing_data:
            BillingDetails.objects.create(order=order, **billing_data)

        for item in items_data:
            OrderItem.objects.create(order=order, **item)

        return order
