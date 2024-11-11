import React from 'react';
import { FolderItem } from '../types';  // Importar FolderItem

interface FolderCardProps {
  folder: FolderItem;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, onClick, onRename, onDelete }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg" onClick={onClick}>
      <div className="flex items-center">
        <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M9 3h6a2 2 0 012 2v1H7V5a2 2 0 012-2zM3 7v14a2 2 0 002 2h14a2 2 0 002-2V7H3z"></path>
        </svg>
        <span>{folder.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={(e) => { e.stopPropagation(); onRename(); }} className="text-gray-600 hover:text-gray-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4h2a1 1 0 011 1v1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1v4h-2V10H9V6a1 1 0 011-1h1V4z"></path>
          </svg>
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-red-600 hover:text-red-800">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};
