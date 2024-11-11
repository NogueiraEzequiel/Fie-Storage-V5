import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  paths: string[];
  onNavigate: (path: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ paths, onNavigate }) => {
  const buildPath = (index: number) => {
    const builtPath = paths.slice(0, index + 1).join('/');
    return builtPath ? `/folder/${builtPath}` : '/folder/';
  };

  const filteredPaths = paths.filter((path) => path !== 'files'); // Filtrar la carpeta 'files'

  return (
    <nav className="flex">
      <Link to="/" className="text-blue-600 hover:text-blue-800" onClick={() => onNavigate('')}>
        Home
      </Link>
      {filteredPaths.map((path, index) => (
        <React.Fragment key={index}>
          <span className="mx-2">/</span>
          <Link
            to={buildPath(index)}
            className="text-blue-600 hover:text-blue-800"
            onClick={() => onNavigate(buildPath(index))}
          >
            {path}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
};
