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


}