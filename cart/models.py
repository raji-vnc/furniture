from django.db import models
from django.contrib.auth.models import User
from products.models import Product

class Cart(models.Model):
    user=models.ForeignKey(User, on_delete=models.CASCADE,null=True,blank=True,related_name='cart')
    session_key = models.CharField(max_length=40, null=True, blank=True, db_index=True)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        if self.user:
            return f"Cart({self.user.username})"
        return f"GuestCart({self.session_key})"
    def merge_with_user_cart(self, user):
        user_cart, _ = Cart.objects.get_or_create(user=user)
        for item in self.items.all():
            existing = CartItem.objects.filter(cart=user_cart, product=item.product).first()
            if existing:
                existing.quantity += item.quantity
                existing.save()
            else:
                item.cart = user_cart
                item.save()
        self.delete()
        return user_cart
    class Meta:
        ordering = ['-created_at']
        db_table = 'carts'
        verbose_name = 'Cart'
        verbose_name_plural = 'Carts'
        constraints = [
        models.UniqueConstraint(
            fields=['user'],
            condition=models.Q(user__isnull=False),
            name='unique_user_cart'
        ),
        models.UniqueConstraint(
            fields=['session_key'],
            condition=models.Q(session_key__isnull=False),
            name='unique_session_cart'
        ),
    ]
    
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

