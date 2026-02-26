from rest_framework import viewsets, permissions
from .models import Comment
from .serializers import CommentSerializer


# Allows read access to everyone; write access only to the comment's author
class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


# ViewSet handling CRUD operations for comments
class CommentViewSet(viewsets.ModelViewSet):
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def get_queryset(self):
        # Eager-load user and movie to avoid N+1 queries
        queryset = Comment.objects.select_related('user', 'movie')
        # Optionally filter comments by movie using ?movie_id=<id>
        movie_id = self.request.query_params.get('movie_id', None)
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset

    def perform_create(self, serializer):
        # Automatically assign the authenticated user as the comment author
        serializer.save(user=self.request.user)

