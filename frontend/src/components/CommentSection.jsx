import { useState, useEffect } from 'react'
import { commentAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

function CommentSection({ movieId }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchComments()
  }, [movieId])

  const fetchComments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await commentAPI.getComments(movieId)
      // Handle DRF pagination format
      setComments(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError('Error loading comments')
      console.error('Error fetching comments:', err)
      setComments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await commentAPI.createComment(movieId, newComment)
      setNewComment('')
      await fetchComments()
    } catch (err) {
      setError('Error adding comment')
      console.error('Error creating comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return

    try {
      setSubmitting(true)
      setError(null)
      await commentAPI.updateComment(commentId, editText)
      setEditingId(null)
      setEditText('')
      await fetchComments()
    } catch (err) {
      setError('Error updating comment')
      console.error('Error updating comment:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return

    try {
      setError(null)
      await commentAPI.deleteComment(commentId)
      await fetchComments()
    } catch (err) {
      setError('Error deleting comment')
      console.error('Error deleting comment:', err)
    }
  }

  const startEdit = (comment) => {
    setEditingId(comment.id)
    setEditText(comment.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  if (loading) {
    return <div className="text-gray-300">Loading comments...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white mb-4">
        Comments ({comments.length})
      </h2>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red resize-none"
            rows="4"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="mt-3 px-6 py-2 bg-netflix-red text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </form>
      ) : (
        <div className="bg-gray-800 px-4 py-3 rounded-lg text-gray-300">
          Sign in to add a comment
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-white font-semibold">
                    {comment.user_username}
                  </span>
                  <span className="text-gray-400 text-sm ml-3">
                    {new Date(comment.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {comment.updated_at !== comment.created_at && (
                    <span className="text-gray-500 text-xs ml-2">(edited)</span>
                  )}
                </div>
                {user?.username === comment.user_username && (
                  <div className="flex gap-2">
                    {editingId !== comment.id && (
                      <>
                        <button
                          onClick={() => startEdit(comment)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-500 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              
              {editingId === comment.id ? (
                <div>
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-netflix-red resize-none"
                    rows="3"
                    disabled={submitting}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editText.trim() || submitting}
                      className="px-4 py-1 bg-netflix-red text-white rounded hover:bg-red-700 transition text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={submitting}
                      className="px-4 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">{comment.text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CommentSection
