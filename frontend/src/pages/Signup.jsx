import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrors({});
    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setErrors(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-netflix-black px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create an account
          </h2>
        </div>
        <form className="mt-8 space-y-6 bg-gray-900 p-8 rounded-lg" onSubmit={handleSubmit}>
          {errors.non_field_errors && (
            <div className="bg-red-500 text-white p-3 rounded">
              {errors.non_field_errors}
            </div>
          )}
          
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">{errors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="sr-only">
                  First Name
                </label>
                <input
                  id="first_name"
                  name="first_name"
                  type="text"
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="sr-only">
                  Last Name
                </label>
                <input
                  id="last_name"
                  name="last_name"
                  type="text"
                  className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="password2" className="sr-only">
                Confirm Password
              </label>
              <input
                id="password2"
                name="password2"
                type="password"
                required
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-500 text-white focus:outline-none focus:ring-netflix-red focus:border-netflix-red sm:text-sm"
                placeholder="Confirm Password"
                value={formData.password2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-netflix-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-netflix-red disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-netflix-red hover:text-red-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;