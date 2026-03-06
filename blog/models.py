from django.db import models

class Blog(models.Model):
    image=models.ImageField(upload_to='blogs/',blank=True,null=True)
    title=models.CharField(max_length=255)
    author=models.CharField(max_length=255)
    content=models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title   
    class Meta:
        ordering=['-created_at']
        db_table='blogs'
        verbose_name='Blog'
        verbose_name_plural='Blogs'