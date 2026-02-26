from django.db import models
from django.contrib.auth.models import User


# Represents a user's score for a specific movie (1 to 5 stars)
class Rating(models.Model):
    # Deletes the rating if the related movie or user is removed
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_ratings')
    score = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # Enforce one rating per user per movie at the database level
            models.UniqueConstraint(fields=['movie', 'user'], name='unique_movie_user_rating')
        ]
        ordering = ['-created_at']
        verbose_name = 'Rating'
        verbose_name_plural = 'Ratings'

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}: {self.score}/5"
