from rest_framework.routers import DefaultRouter
from .views import UserViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
urlpatterns = router.urls

from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_api),
    path('login/', views.login_api),
]

