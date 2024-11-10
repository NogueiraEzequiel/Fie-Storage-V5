import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbProps {
  paths: string[];
  onNavigate: (path: string) => void;
}

export const Breadcrumb = ({ paths, onNavigate }: BreadcrumbProps) => {
  const handleNavigate = (index: number) => {
    const path = paths.slice(0, index + 1).join('/');
    onNavigate(path);
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 mb-6 text-gray-600">
      <Link to="/" className="hover:text-blue-800 flex items-center" onClick={() => onNavigate('')}>
        <Home size={16} className="mr-1" />
        Home
      </Link>
      {paths.map((segment, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="mx-2 text-gray-400" />
          <Link
            to={`/${paths.slice(0, index + 1).join('/')}`}
            className="hover:text-blue-800"
            onClick={() => handleNavigate(index)}
            aria-current={index === paths.length - 1 ? 'page' : undefined}
          >
            {segment}
          </Link>
        </div>
      ))}
    </nav>
  );
};
