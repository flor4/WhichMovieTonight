from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommentViewSet

# Register CommentViewSet with the router to auto-generate standard CRUD routes
router = DefaultRouter()
router.register(r'', CommentViewSet, basename='comment')

urlpatterns = [
    path('', include(router.urls))
]
