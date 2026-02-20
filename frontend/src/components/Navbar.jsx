import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

// Navbar component with mobile responsiveness
function Navbar() {
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle user logout
    const handleLogout = async () => {
        await logout();
        navigate("/");
        setMobileMenuOpen(false);
    };

    // Close mobile menu when a link is clicked
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };
    
    // Render the navigation bar
    return (
        // Main navigation container
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

                {/* User authentication links and mobile menu toggle button */}
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

                {/* Mobile menu toggle button */}
                <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex flex-col space-y-1.5 p-2"
                aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}> </span>
                    <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-6 h-0.5 bg-white transition-all ${mobileMenuOpen ? '-rotate-45 -translate-2' : ''}`}></span>
                </button>
            </div>

            {/* Mobile menu for smaller screens */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-black bg-opacity-95 absolute top-full left-0 w-full py-4 px-4 space-y-4">
                    <Link
                        to="/"
                        className="block text-white hover:text-gray-300 transition py-2"
                        onClick={closeMobileMenu}
                    >
                        Home
                    </Link>
                    {user ? (
                        <>
                            <div className="text-gray-400 py-2 border-t border-gray-700">
                                Hello, {user.username}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="block w-full text-left text-white hover:text-gray-300 transition py-2"
                            >
                            Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="block text-white hover:text-gray-300 transition py-2"
                                onClick={closeMobileMenu}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="block bg-netflix-red hover:bg-red-700 text-white px-4 py-2 rounded transition text-center"
                                onClick={closeMobileMenu}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
