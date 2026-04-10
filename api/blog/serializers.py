from rest_framework import serializers
from blog.models import Blog


class BlogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Blog
        fields = '__all__'
        read_only_fields = ('author', 'created_at')

    def create(self, validated_data):
        """
        Fill author from the authenticated user when it isn't provided.
        """
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data.setdefault(
                "author",
                request.user.get_username() or request.user.email or "Anonymous",
            )
        return super().create(validated_data)
