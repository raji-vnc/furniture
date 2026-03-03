from django.db import models


class Product(models.Model):
    image=models.URLField()
    name=models.CharField(max_length=255)
    price=models.DecimalField(max_digits=10, decimal_places=2)
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name
    class Meta:
        ordering=['-created_at']
        db_table='products'
        verbose_name='Product'
        verbose_name_plural='Products'

