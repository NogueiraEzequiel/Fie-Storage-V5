import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, FolderOpen, User } from 'lucide-react';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-4xl font-bold text-blue-800 tracking-wide">
            FIE-Storage
          </Link>

          {currentUser ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <FolderOpen size={20} />
                <span>Repositorio</span>
              </Link>

              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <User size={20} />
                <span>Perfil</span>
              </Link>

              <button
                onClick={() => logout()}
                className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
