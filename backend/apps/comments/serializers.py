from rest_framework import serializers
from .models import Comment


# Serializer for comment data; exposes the author's username as a read-only field
class CommentSerializer(serializers.ModelSerializer):
    # Read the username from the related user object
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'movie', 'user', 'user_username', 'text', 'created_at', 'updated_at']
        # user and timestamps are set automatically, not by the client
        read_only_fields = ['user', 'created_at', 'updated_at']
