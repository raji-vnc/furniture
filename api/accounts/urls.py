from rest_framework.routers import DefaultRouter
from .views import UserViewSet
from django.urls import path
from . import views
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')




urlpatterns = [
    path('register/', views.register_api, name='register_api'),
    path('login/', views.login_api, name='login_api'),
]
urlpatterns += router.urls
