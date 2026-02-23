import { useState, useEffect } from 'react';
import { movieAPI } from '../services/api'
import MovieCard from '../components/MovieCard'
import SearchBar from '../components/SearchBar'

function Home() {
    const [movies, setMovies] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [hasNext, setHasNext] = useState(false)
    const [hasPrevious, setHasPrevious] = useState(false)

    useEffect(() => {
        fetchMovies(searchQuery, currentPage)
    }, [searchQuery, currentPage])

    const fetchMovies = async (query, page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const data = await movieAPI.getMovies(query, page)

                if (data.results) {
                    setMovies(data.results)
                    setHasNext(!!data.next)
                    setHasPrevious(!!data.previous)

                    if (data.count) {
                        const pageSize = 100
                        setTotalPages(Math.ceil(data.count / pageSize))
                    }
                } else {
                    setMovies(data)
                    setHasNext(false)
                    setHasPrevious(false)
                    setTotalPages(1)
                }
            } catch (err) {
                setError('Failed to fetch movies. Please try later.')
                console.error('Error fetching movies:', err)
            } finally {
                setLoading(false)
            }
    }

    const handleSearch = (query) => {
        setSearchQuery(query)
        setCurrentPage(1)
    }

    const handleNextPage = () => {
        if (hasNext) {
            setCurrentPage(prev => prev + 1)
            window.scrollTo({ top: 0, behavior: 'smooth '})
        }
    }

        const handlePreviousPage = () => {
        if (hasPrevious) {
            setCurrentPage(prev => prev - 1)
            window.scrollTo({ top: 0, behavior: 'smooth '})
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-2xl text-red-500">{error}</div>
            </div>
        )
    }


}