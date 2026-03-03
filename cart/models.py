from django.db import models

class Cart(models.Model):
    user=models.ForeignKey('auth.User', on_delete=models.CASCADE)
    product=models.ForeignKey('products.Product', on_delete=models.CASCADE)
    image=models.URLField()
    name=models.CharField(max_length=255)
    quantity=models.PositiveIntegerField(default=1)
    price=models.DecimalField(max_digits=10, decimal_places=2)
    total_price=models.DecimalField(max_digits=10, decimal_places=2)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.product.name} (x{self.quantity})"
    
    class Meta:
        ordering=['-created_at']
        db_table='cart'
        verbose_name='Cart Item'
        verbose_name_plural='Cart Items'