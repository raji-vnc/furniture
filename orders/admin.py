from django.contrib import admin

from orders.models import BillingDetails, Order, OrderItem, Payment


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_amount", "payment_method", "status", "created_at")
    list_filter = ("payment_method", "status", "created_at")
    search_fields = ("id", "user__username", "user__email")
    ordering = ("-created_at",)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("id", "order", "product", "quantity", "price")
    search_fields = ("order__id", "product__name")


@admin.register(BillingDetails)
class BillingDetailsAdmin(admin.ModelAdmin):
    list_display = ("order", "first_name", "last_name", "email", "phone")
    search_fields = ("order__id", "first_name", "last_name", "email")


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "order_id",
        "payment_id",
        "order_payment_method",
        "order_status",
        "amount",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = ("order_id", "payment_id", "user__username", "user__email")
    ordering = ("-created_at",)

    @admin.display(description="Payment Method")
    def order_payment_method(self, obj):
        order = Order.objects.filter(id=obj.order_id).only("payment_method").first()
        return order.get_payment_method_display() if order else "Order missing"

    @admin.display(description="Order Status")
    def order_status(self, obj):
        order = Order.objects.filter(id=obj.order_id).only("status").first()
        return order.get_status_display() if order else "Order missing"
