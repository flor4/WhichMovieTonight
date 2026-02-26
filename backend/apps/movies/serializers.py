from rest_framework import serializers
from .models import Movie


class MovieListSerializer(serializers.ModelSerializer):
    """Simplified serializer for movie list view"""
    # Computed fields derived from model methods
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'genre', 'release_date', 'poster_url',
            'netflix_available', 'disney_plus_available', 'prime_video_available',
            'average_rating', 'rating_count'
        ]
    
    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_rating_count(self, obj):
        return obj.rating_count()


class MovieSerializer(serializers.ModelSerializer):
    """Complete serializer for movie detail view"""
    # Computed fields derived from model methods
    average_rating = serializers.SerializerMethodField()
    rating_count = serializers.SerializerMethodField()
    # Exposes cast as a Python list instead of a raw comma-separated string
    cast_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Movie
        fields = [
            'id', 'title', 'synopsis', 'genre', 'release_date', 'cast', 'cast_list',
            'poster_url', 'backdrop_url', 'trailer_url',
            'netflix_available', 'disney_plus_available', 'prime_video_available',
            'average_rating', 'rating_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        return obj.average_rating()
    
    def get_rating_count(self, obj):
        return obj.rating_count()
    
    def get_cast_list(self, obj):
        return obj.get_cast_list()
