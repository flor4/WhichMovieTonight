from django.db import models
from django.db.models import Avg


# Represents a movie with its metadata and streaming availability
class Movie(models.Model):
    title = models.CharField(max_length=255)
    synopsis = models.TextField()
    genre = models.CharField(max_length=100)
    release_date = models.DateField()
    # Stored as a comma-separated string; use get_cast_list() for a Python list
    cast = models.TextField(help_text="Comma-separated list of cast members")
    poster_url = models.URLField(max_length=500)
    backdrop_url = models.URLField(max_length=500)
    trailer_url = models.URLField(max_length=500, blank=True, null=True)
    
    # Streaming availability flags per platform
    netflix_available = models.BooleanField(default=False)
    disney_plus_available = models.BooleanField(default=False)
    prime_video_available = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        ordering = ['-release_date']
        verbose_name = 'Movie'
        verbose_name_plural = 'Movies'

    def __str__(self):
        return self.title

    def get_cast_list(self):
        """Return cast as a list"""
        return [name.strip() for name in self.cast.split(',')]
    
    def average_rating(self):
        """Calculate average rating for this movie"""
        result = self.ratings.aggregate(Avg('score'))['score__avg']
        return round(result, 1) if result else None
    
    def rating_count(self):
        """Return total number of ratings"""
        return self.ratings.count()
