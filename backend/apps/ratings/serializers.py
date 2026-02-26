from rest_framework import serializers
from .models import Rating


# Serializer for rating data; exposes the author's username as a read-only field
class RatingSerializer(serializers.ModelSerializer):
    # Read the username from the related user object
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'movie', 'user', 'user_username', 'score', 'created_at', 'updated_at']
        # user and timestamps are set automatically, not by the client
        read_only_fields = ['user', 'created_at', 'updated_at']
