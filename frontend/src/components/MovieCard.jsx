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
            </div>
        </Link>
    )
}