from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'movie', 'user', 'user_username', 'text', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
