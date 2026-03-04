from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Order(models.Model):
    STSTUS_CHOICES=(
        ('PENDING','Pending'),
        ('PAID','Paid'),
        ('SHIPPED','Shipped'),
        ('DELIVERED','Delivered'),
        ('COMPLETED','Completed'),
        ('CANCELED','Canceled'),
    )
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    total_amount=models.DecimalField(max_digits=10, decimal_places=2)
    status=models.CharField(max_length=20, choices=STSTUS_CHOICES, default='PENDING')
    created_at=models.DateTimeField(auto_now_add=True)  

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
    class Meta:
        ordering=['-created_at']
        db_table='orders'
        verbose_name='Order'
        verbose_name_plural='Orders'

class OrderItem(models.Model):
    order=models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product=models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField(default=1)
    price=models.DecimalField(max_digits=10, decimal_places=2)

    def total_price(self):
        return self.price * self.quantity

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"
    
    class Meta:
        db_table='order_items'
        verbose_name='Order Item'
        verbose_name_plural='Order Items'

class BillingDetails(models.Model):
    order=models.OneToOneField(Order, on_delete=models.CASCADE)
    country=models.CharField(max_length=255)
    state=models.CharField(max_length=255)
    first_name=models.CharField(max_length=255)
    last_name=models.CharField(max_length=255)
    company_name=models.CharField(max_length=255, blank=True, null=True)
    address=models.CharField(max_length=255)
    zip_code=models.CharField(max_length=20)
    email=models.EmailField()
    phone=models.CharField(max_length=20)
    order_notes=models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Billing Details for Order {self.order.id}"
    class Meta:
        db_table='billing_details'
        verbose_name='Billing Detail'
        verbose_name_plural='Billing Details'