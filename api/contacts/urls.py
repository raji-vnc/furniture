from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import ContactViewSet, contact_update_delete

router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')
urlpatterns = [
    path('', include(router.urls)),
    path('contacts/<int:pk>/', contact_update_delete, name='contact-update-delete'),
]
