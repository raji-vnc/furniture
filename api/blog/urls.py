from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import BlogViewSet, blog_list, blog_detail, create_blog, update_blog, delete_blog

router = DefaultRouter()
router.register(r'blogs', BlogViewSet, basename='blog')
urlpatterns = [
    path('', include(router.urls)),
    path('blogs-list/', blog_list, name='blog-list-legacy'),
    path('blogs-list/<int:pk>/', blog_detail, name='blog-detail-legacy'),
    path('create/', create_blog, name='blog-create'),
    path('update/<int:pk>/', update_blog, name='blog-update'),
    path('delete/<int:pk>/', delete_blog, name='blog-delete'),
]
