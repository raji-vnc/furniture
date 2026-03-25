from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet
from django.urls import path
from . import views 
router = DefaultRouter()
router.register(r'profiles', ProfileViewSet, basename='profile')
urlpatterns = router.urls





