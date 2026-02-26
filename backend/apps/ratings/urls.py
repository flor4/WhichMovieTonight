from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RatingViewSet

# Register RatingViewSet with the router to auto-generate standard CRUD routes
router = DefaultRouter()
router.register(r'', RatingViewSet, basename='rating')

urlpatterns = [
    path('', include(router.urls))
]
