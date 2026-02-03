from rest_framework import viewsets, permisssions
from .models import Comment
from .serializers import CommentSerializer

class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user

class CommentViewSet(viewsets.ModelViewSet):
    
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerReadOnly]

    def get_queryset(self):

        queryset = Comment.objects.select_related('user', 'movie')
        movie_id = self.request.query_params.get('movie_id', None)
        if movie_id:
            queryset = queryset.filter(movie_id=movie_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

