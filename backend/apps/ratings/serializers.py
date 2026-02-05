from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fiels = ['id', 'movie', 'user', 'user_username', 'score', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
