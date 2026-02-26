from django.db import models
from django.contrib.auth.models import User


# Represents a user comment linked to a specific movie
class Comment(models.Model):
    # Deletes the comment if the related movie or user is removed
    movie = models.ForeignKey('movies.Movie', on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Most recent comments are returned first
        ordering = ['-created_at']
        verbose_name = 'Comment'
        verbose_name_plural = 'Comments'

    def __str__(self):
        return f"{self.user.username} on {self.movie.title}"
