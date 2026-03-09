from rest_framework.routers import DefaultRouter
from .views import ContactViewSet
from django.urls import path
from .views import contact_update_delete
router = DefaultRouter()
router.register(r'contacts', ContactViewSet, basename='contact')
urlpatterns = router.urls

urlpatterns=[
path('contacts/<int:pk>/',contact_update_delete)
]