import { Link } from "react-router-dome";

{/* component of movie card with poster, title, genre, year and average rating display */}
function MovieCard({ movie }) {
    return (
        <Link to={`/movie/${movie.id}`}>
            <div className="group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 cursor-pointer">
                <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                    onError={(event) => {
                        event.target.src = "https://via.placeholder.com/500x750?text=No+Image"
                    }}
                />

                {/* Rating badge - always visible */}
                {movie.average_rating && (
                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <span className="text-yellow-400 text-lg">★</span>
                        <span className="text-white font-bold text-sm">{movie.average_rating}</span>
                        <span className="text-gray-400 text-xs">({movie.rating_count})</span>
                    </div>
                )}

                {/* Title overlay - visible on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white text-xl font-bold mb-2">{movie.title}</h3>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">{movie.genre}</span>
                            <span className="text-sm text-gray-300">{new Date(movie.release_date).getFullYear()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}