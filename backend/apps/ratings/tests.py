from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from apps.movies.models import Movie
from .models import Rating


# ============= Tests des modèles =============
class RatingModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username="testuser", password="password")
        self.movie = Movie.objects.create(
            title="Test Movie",
            synopsis="A test synopsis",
            genre="Drama",
            release_date="2023-01-01",
            cast="Actor 1, Actor 2",
            poster_url="http://example.com/poster.jpg",
            backdrop_url="http://example.com/backdrop.jpg",
        )

    def test_create_rating(self):
        """Test that a rating can be created."""
        rating = Rating.objects.create(movie=self.movie, user=self.user, score=4)
        self.assertEqual(rating.score, 4)
        self.assertEqual(rating.movie, self.movie)
        self.assertEqual(rating.user, self.user)

    def test_unique_constraint(self):
        """Test that a user cannot rate the same movie twice."""
        Rating.objects.create(movie=self.movie, user=self.user, score=4)
        with self.assertRaises(Exception):
            Rating.objects.create(movie=self.movie, user=self.user, score=5)

    def test_rating_str(self):
        """Test the string representation of a rating."""
        rating = Rating.objects.create(movie=self.movie, user=self.user, score=4)
        self.assertEqual(str(rating), f"{self.user.username} - {self.movie.title}: {rating.score}/5")


# ============= Tests des vues (API) =============
class RatingViewSetTest(APITestCase):
    """Tests pour les endpoints de l'API Ratings"""

    def setUp(self):
        """Crée des données de test avant chaque test"""
        self.user1 = User.objects.create_user(username="user1", password="password")
        self.user2 = User.objects.create_user(username="user2", password="password")
        
        self.movie1 = Movie.objects.create(
            title="Movie 1",
            synopsis="Synopsis 1",
            genre="Action",
            release_date="2023-01-01",
            cast="Actor 1",
            poster_url="http://example.com/1.jpg",
            backdrop_url="http://example.com/1b.jpg",
        )
        
        self.movie2 = Movie.objects.create(
            title="Movie 2",
            synopsis="Synopsis 2",
            genre="Drama",
            release_date="2023-02-01",
            cast="Actor 2",
            poster_url="http://example.com/2.jpg",
            backdrop_url="http://example.com/2b.jpg",
        )
        
        # Créer une note de test
        self.rating1 = Rating.objects.create(
            movie=self.movie1,
            user=self.user1,
            score=5
        )
        
        self.client = APIClient()

    def test_list_ratings(self):
        """Test GET /api/ratings/ - Lister toutes les notes"""
        url = reverse('rating-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertGreaterEqual(len(results), 1)

    def test_filter_ratings_by_movie(self):
        """Test GET /api/ratings/?movie_id=1 - Filtrer par film"""
        url = reverse('rating-list')
        response = self.client.get(url, {'movie_id': self.movie1.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['movie'], self.movie1.id)

    def test_create_rating_authenticated(self):
        """Test POST /api/ratings/ - Créer une note (utilisateur authentifié)"""
        self.client.force_authenticate(user=self.user2)
        
        url = reverse('rating-list')
        data = {
            'movie': self.movie2.id,
            'score': 4
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Rating.objects.count(), 2)
        self.assertEqual(response.data['score'], 4)

    def test_create_rating_unauthenticated(self):
        """Test POST /api/ratings/ - Non authentifié ne peut pas noter"""
        url = reverse('rating-list')
        data = {
            'movie': self.movie2.id,
            'score': 4
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_existing_rating(self):
        """Test POST /api/ratings/ - Mettre à jour une note existante"""
        self.client.force_authenticate(user=self.user1)
        
        url = reverse('rating-list')
        data = {
            'movie': self.movie1.id,
            'score': 3  # Changer de 5 à 3
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Rating.objects.count(), 1)  # Toujours 1 note
        self.rating1.refresh_from_db()
        self.assertEqual(self.rating1.score, 3)

    def test_update_rating_as_owner(self):
        """Test PUT /api/ratings/{id}/ - Propriétaire peut modifier"""
        self.client.force_authenticate(user=self.user1)
        
        url = reverse('rating-detail', kwargs={'pk': self.rating1.pk})
        data = {
            'movie': self.movie1.id,
            'score': 2
        }
        
        response = self.client.put(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.rating1.refresh_from_db()
        self.assertEqual(self.rating1.score, 2)

    def test_delete_rating_as_owner(self):
        """Test DELETE /api/ratings/{id}/ - Propriétaire peut supprimer"""
        self.client.force_authenticate(user=self.user1)
        
        url = reverse('rating-detail', kwargs={'pk': self.rating1.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Rating.objects.count(), 0)

    def test_rating_score_validation(self):
        """Test que seules les notes de 1 à 5 sont acceptées"""
        self.client.force_authenticate(user=self.user2)
        
        url = reverse('rating-list')
        data = {
            'movie': self.movie2.id,
            'score': 6  # Score invalide
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
