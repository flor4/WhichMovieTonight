import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { movieAPI, ratingAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import CommentSection from '../components/CommentSection'

function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userRating, setUserRating] = useState(null)
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    fetchMovie()
  }, [id])

  const fetchMovie = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await movieAPI.getMovie(id)
      setMovie(data)
      setUserRating(data.user_rating)
    } catch (err) {
      setError('Failed to fetch movie details. Please try again later.')
      console.error('Error fetching movie:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRatingChange = async (score) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      setSubmittingRating(true)
      await ratingAPI.createOrUpdateRating(id, score)
      setUserRating(score)
      // Refresh movie to get updated average
      await fetchMovie()
    } catch (err) {
      console.error('Error submitting rating:', err)
      alert('Error submitting rating')
    } finally {
      setSubmittingRating(false)
    }
  }

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop()
    return `https://www.youtube.com/embed/${videoId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-white">Loading movie details...</div>
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-2xl text-red-500 mb-4">{error || 'Movie not found'}</div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition"
        >
          Back to Home
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Backdrop */}
      <div
        className="relative h-[70vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${movie.backdrop_url})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-netflix-black via-netflix-black/60 to-transparent" />
        
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-12 pb-12">
          <button
            onClick={() => navigate('/')}
            className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
          >
            ← Back
          </button>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            {movie.title}
          </h1>
          
          <div className="flex items-center space-x-4 text-gray-300 mb-6">
            <span className="text-lg">{movie.genre}</span>
            <span>•</span>
            <span>{new Date(movie.release_date).getFullYear()}</span>
            {movie.average_rating && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="text-white font-bold">{movie.average_rating}</span>
                  <span className="text-gray-400 text-sm">({movie.rating_count} notes)</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 md:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Synopsis */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Synopsis</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              {movie.synopsis}
            </p>
          </div>

          {/* Cast */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Cast</h2>
            <div className="flex flex-wrap gap-3">
              {movie.cast_list?.map((actor, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-800 text-white rounded-full text-sm"
                >
                  {actor}
                </span>
              ))}
            </div>
          </div>

          {/* Streaming or Media Library Availability */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Streaming or Media Library Availability</h2>
            <div className="bg-gray-800 rounded-lg p-6">
              <p className="text-gray-300 mb-4">Available on:</p>
              <div className="flex flex-wrap gap-4">
                {/* Toulouse Media Library - Always displayed first */}
                <a
                  href="http://catalogues.toulouse.fr/web2/tramp2.exe/log_in?setting_key=BMT1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-all transform hover:scale-105"
                >
                  <img 
                    src="https://bibliotheque.toulouse.fr/wp-content/uploads/sites/16/2024/09/cropped-Biblio-Header.png" 
                    alt="Toulouse Media Library"
                    className="w-6 h-6 object-contain bg-white rounded"
                  />
                  Media Library
                </a>
                
                {movie.netflix_available && (
                  <a
                    href="https://www.netflix.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"/>
                    </svg>
                    Netflix
                  </a>
                )}
                {movie.disney_plus_available && (
                  <a
                    href="https://www.disneyplus.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.718 4.707c-3.735 0-6.773 3.044-6.773 6.786 0 3.742 3.038 6.786 6.773 6.786 3.735 0 6.773-3.044 6.773-6.786 0-3.742-3.038-6.786-6.773-6.786zm0 12.02c-2.882 0-5.227-2.35-5.227-5.234 0-2.884 2.345-5.234 5.227-5.234 2.882 0 5.227 2.35 5.227 5.234 0 2.884-2.345 5.234-5.227 5.234z"/>
                    </svg>
                    Disney+
                  </a>
                )}
                {movie.prime_video_available && (
                  <a
                    href="https://www.primevideo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-all transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3.05 14.51A10.98 10.98 0 0 1 1 8.45C1 3.78 4.78 0 9.45 0c2.39 0 4.55.99 6.1 2.59.06.06.06.18 0 .24l-1.07 1.08c-.06.06-.15.06-.21.01A7.46 7.46 0 0 0 9.45 2.4C6.09 2.4 3.4 5.09 3.4 8.45c0 1.59.62 3.04 1.62 4.13.08.08.06.21-.03.26l-1.52.84c-.09.06-.23.01-.29-.08l-.13-.19M22.86 17.78l-3.28-3.28a7.5 7.5 0 1 0-1.07 1.07l3.28 3.28c.29.29.77.29 1.07 0 .3-.3.3-.78 0-1.07M15 15c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4"/>
                    </svg>
                    Prime Video
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Trailer */}
          {movie.trailer_url && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Trailer</h2>
              <div className="aspect-video w-full max-w-4xl">
                <iframe
                  src={getYouTubeEmbedUrl(movie.trailer_url)}
                  title="Movie Trailer"
                  className="w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Rating Section */}
          <div className="mb-12 bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">
              {user ? 'Your Rating' : 'Rate this movie'}
            </h2>
            {user ? (
              <div className="flex items-center gap-4">
                <StarRating 
                  value={userRating || 0} 
                  onChange={handleRatingChange}
                  readonly={submittingRating}
                />
                <span className="text-gray-300">
                  {userRating ? `You rated ${userRating}/5` : 'Click to rate'}
                </span>
              </div>
            ) : (
              <p className="text-gray-400">
                <button
                  onClick={() => navigate('/login')}
                  className="text-netflix-red hover:underline"
                >
                  Sign in
                </button>
                {' '}to rate this movie
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentSection movieId={id} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieDetail