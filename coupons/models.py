from django.db import models

class Coupon(models.Model):
    code=models.CharField(max_length=50, unique=True)
    discount=models.DecimalField(max_digits=5, decimal_places=2)
    active=models.BooleanField(default=True)
    expiry_date=models.DateField()

    def __str__(self):
        return self.code    
    class Meta:
        ordering=['-expiry_date']
        db_table='coupons'
        verbose_name='Coupon'
        verbose_name_plural='Coupons'