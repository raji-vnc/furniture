from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    user=models.OneToOneField(User,on_delete=models.CASCADE)
    profile_image=models.ImageField(upload_to='profiles/',default='default.png',blank=True,null=True)

    def __str__(self):
        return self.user.username
    
    class Meta:
        db_table='accounts'
        verbose_name='account'
        verbose_name_plural='accounts'
