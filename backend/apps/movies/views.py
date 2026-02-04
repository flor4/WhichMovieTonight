from rest_framework import viewsets, filters, permissions
from django.db.models import Q
from .models import Movie
from .serializers import MovieSerializer, MovieListSerializer

class IsAdminOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class MovieViewSet(viewsets.ModelViewSet):
    queryset = Movie.objects.all()
    serializer_class = MovieSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'genre', 'cast', 'synopsis']

    def get_serializer_class(self):
        if self.action == 'list':
            return MovieListSerializer
        return MovieSerializer
    
    def get_queryset(self):

        queryset = Movie.objects.all()
        search_query = self.request.query_params.get('search', None)

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(genre__icontains=search_query) |
                Q(cast__icontains=search_query) |
                Q(synopsis__icontains=search_query)
            )
        return queryset
