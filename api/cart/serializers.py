from rest_framework import serializers

from cart.models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    product_price = serializers.DecimalField(
        source="product.price",
        read_only=True,
        max_digits=10,
        decimal_places=2,
    )
    product_image = serializers.ImageField(source="product.image", read_only=True)
    image = serializers.SerializerMethodField()
    line_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product_name",
            "product_price",
            "product_image",
            "image",
            "quantity",
            "line_total",
        ]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.product.image:
            url = obj.product.image.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_line_total(self, obj):
        return obj.quantity * obj.product.price


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    grand_total = serializers.SerializerMethodField()

    def get_grand_total(self, obj):
        return sum(item.total_price() for item in obj.items.all())

    class Meta:
        model = Cart
        fields = ["id", "user", "items", "grand_total", "created_at"]
