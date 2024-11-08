import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Upload, FolderOpen, User } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, userRole, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-800 tracking-wide">
            FIE-Storage
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-4">
              {userRole === 'student' && (
                <Link
                  to="/upload"
                  className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                >
                  <Upload size={20} />
                  <span>Upload</span>
                </Link>
              )}

              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <FolderOpen size={20} />
                <span>Files</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <User size={20} />
                <span>Profile</span>
              </Link>

              <button
                onClick={() => logout()}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
