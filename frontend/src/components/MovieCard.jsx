import { Link } from "reacr-router-dome";

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
            </div>
        </Link>
    )
}