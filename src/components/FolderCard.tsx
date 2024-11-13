import React from 'react';
import { FolderItem } from '../types';
import { Folder, PencilLine, X } from 'lucide-react'; // Importar los íconos necesarios de Lucide
import { useAuth } from '../contexts/AuthContext'; // Importar el contexto de autenticación

interface FolderCardProps {
  folder: FolderItem;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onRename, onDelete }) => {
  const { userRole } = useAuth(); // Obtener el rol del usuario desde el contexto de autenticación

  return (
    <div className="flex items-center justify-between p-4 bg-white border-2 border-blue-600 shadow-md rounded-lg cursor-pointer hover:shadow-lg" onClick={onClick}>
      <div className="flex items-center">
        <Folder className="w-6 h-6 text-blue-600 mr-2" /> {/* Usar el ícono de carpeta de Lucide */}
        <span>{folder.name}</span>
      </div>
      {userRole === 'admin' && ( // Mostrar las opciones solo si el usuario es administrador
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); onRename(); }}
            className="text-blue-600 hover:text-blue-800"
          >
            <PencilLine className="w-6 h-6" /> {/* Usar el ícono PencilLine de Lucide */}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="text-red-600 hover:text-red-800"
          >
            <X className="w-6 h-6" /> {/* Usar el ícono X de Lucide */}
          </button>
        </div>
      )}
    </div>
  );
};

export default FolderCard;
