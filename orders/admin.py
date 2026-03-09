from django.contrib import admin
from orders.models import Order,OrderItem,BillingDetails,Payment

admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(BillingDetails)
admin.site.register(Payment)
