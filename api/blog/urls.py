from rest_framework.routers import DefaultRouter
from .views import BlogViewSet
from django.urls import path
from .views import blog_list,blog_detail,create_blog,update_blog,delete_blog
router = DefaultRouter()
router.register(r'blogs', BlogViewSet, basename='blog')
urlpatterns = router.urls

urlpatterns=[
path('blogs/',blog_list),
path('blogs/<int:pk>/',blog_detail),
path('create/',create_blog),
path('update/<int:pk>/',update_blog),
path('delete/<int:pk>/',delete_blog)
]