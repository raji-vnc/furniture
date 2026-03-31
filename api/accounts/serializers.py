from rest_framework import serializers
from django.contrib.auth.models import User 
from accounts.models import Profile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class ProfileSerializer(serializers.ModelSerializer):
    username=serializers.CharField(source='user.username',read_only=True)

    class Meta:
        model=Profile
        fields=['username','profile_image']
