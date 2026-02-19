import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
        setMobileMenuOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };
    
    return (
        <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black to-transparent">
            <div className="px-4 md:px-12 py-4 md:py-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/" className="flex items-center" onClick={closeMobileMenu}>
                        <h1 className="text-netflix-red font-bold">
                            <span className="hidden md:inline text-4xl">WhichMovieTonight</span>
                            <span className="md:hidden text-2xl">WMT</span>
                        </h1>
                    </Link>
                    <div className="ml-8 hidden md:flex space-x-8">
                        <Link to="/" className="text-white hover:text-gray-300 transition">
                            Home
                        </Link>
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    {user ? (
                        <>
                            <span className="text-white">
                                Hello, {user.username}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-white hover:text-gray-300 transition"
                                >
                                    Logout
                                </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-white hover:text-gray-300 transition"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}