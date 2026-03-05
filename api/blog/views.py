from urllib import response

from rest_framework.viewsets import ModelViewSet
from .serializers import BlogSerializer
from blog.models import Blog
from rest_framework.decorators import api_view
from rest_framework.response import Response


class BlogViewSet(ModelViewSet):
    queryset = Blog.objects.all()
    serializer_class = BlogSerializer

@api_view(['GET'])
def blog_list(request):
    blogs=Blog.objects.all()
    serializer=BlogSerializer(blogs,many=True)
    return Response(serializer.data)

@api_view(['GET'])
def blog_detail(request,pk):
    try:
        blog=Blog.objects.get(id=pk)
    except Blog.DoesNotExist:
        return Response({
            "message":"blog is not found"
        })
    serializer=BlogSerializer(blog)
    return Response(serializer.data)
