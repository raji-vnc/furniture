from django.contrib import admin
from django.contrib import messages

from cart.models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    autocomplete_fields = ("product",)
    fields = ("product", "quantity", "item_total")
    readonly_fields = ("item_total",)

    def item_total(self, obj):
        if not obj.pk:
            return "0.00"
        return f"{obj.total_price():.2f}"

    item_total.short_description = "Line total"


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ("id", "customer", "session_key", "item_count", "cart_total", "created_at")
    search_fields = ("user__username", "session_key", "items__product__name")
    list_filter = ("created_at",)
    readonly_fields = ("created_at", "item_count", "cart_total")
    inlines = [CartItemInline]
    actions = ("cleanup_empty_carts", "merge_selected_guest_carts_to_current_user")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user").prefetch_related("items__product")

    def customer(self, obj):
        return obj.user.username if obj.user else "Guest"

    def item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def cart_total(self, obj):
        total = sum(item.total_price() for item in obj.items.all())
        return f"{total:.2f}"

    customer.short_description = "Customer"
    item_count.short_description = "Items"
    cart_total.short_description = "Cart total"

    @admin.action(description="Delete selected empty carts")
    def cleanup_empty_carts(self, request, queryset):
        empty_cart_ids = [cart.id for cart in queryset if cart.items.count() == 0]
        if not empty_cart_ids:
            self.message_user(request, "No empty carts selected.", level=messages.WARNING)
            return

        deleted_count, _ = Cart.objects.filter(id__in=empty_cart_ids).delete()
        self.message_user(
            request,
            f"Deleted {deleted_count} empty cart(s).",
            level=messages.SUCCESS,
        )

    @admin.action(description="Merge selected guest carts into my cart")
    def merge_selected_guest_carts_to_current_user(self, request, queryset):
        if not request.user.is_authenticated:
            self.message_user(request, "You must be logged in.", level=messages.ERROR)
            return

        guest_carts = queryset.filter(user__isnull=True)
        if not guest_carts.exists():
            self.message_user(request, "Select at least one guest cart.", level=messages.WARNING)
            return

        merged_count = 0
        for cart in guest_carts:
            cart.merge_with_user_cart(request.user)
            merged_count += 1

        self.message_user(
            request,
            f"Merged {merged_count} guest cart(s) into {request.user.username}.",
            level=messages.SUCCESS,
        )


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ("id", "cart", "product", "quantity", "unit_price", "line_total")
    search_fields = ("product__name", "cart__user__username", "cart__session_key")
    list_select_related = ("cart", "product", "cart__user")
    autocomplete_fields = ("cart", "product")

    def unit_price(self, obj):
        return f"{obj.product.price:.2f}"

    def line_total(self, obj):
        return f"{obj.total_price():.2f}"

    unit_price.short_description = "Unit price"
    line_total.short_description = "Line total"
