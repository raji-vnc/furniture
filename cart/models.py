from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Cart(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE)
    cretated_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"
    class Meta:
        ordering=['-cretated_at']
        db_table='carts'
        verbose_name='Cart'
        verbose_name_plural='Carts'
    
class CartItem(models.Model):
        
    cart = models.ForeignKey(Cart, related_name="items", on_delete=models.CASCADE)
    product=models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity=models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.product.price * self.quantity   

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"
                
    class Meta:
        db_table='cart_items'
        verbose_name='Cart Item'
        verbose_name_plural='Cart Items'

