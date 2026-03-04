from django.db import models


class Testimonial(models.Model):
    name=models.CharField(max_length=255)
    image=models.ImageField(upload_to='testimonials/')
    feedback=models.TextField()
    position=models.CharField(max_length=255)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    class Meta:
        ordering=['-created_at']
        db_table='testimonials'
        verbose_name='Testimonial'
        verbose_name_plural='Testimonials'