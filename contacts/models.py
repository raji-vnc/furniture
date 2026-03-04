from django.db import models

class Contact(models.Model):
    firstname=models.CharField(max_length=255)
    lastname=models.CharField(max_length=255)
    email=models.EmailField()
    message=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.firstname
    class Meta:
        ordering=['-created_at']
        db_table='contacts'
        verbose_name='Contact'
        verbose_name_plural='Contacts'