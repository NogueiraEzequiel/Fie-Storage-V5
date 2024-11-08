import { Folder } from 'lucide-react';
import { FolderItem } from '../types';

interface FolderCardProps {
  folder: FolderItem;
  onClick: (path: string) => void;
}

export const FolderCard = ({ folder, onClick }: FolderCardProps) => {
  return (
    <button
      onClick={() => onClick(folder.fullPath)}
      className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full"
    >
      <Folder className="text-blue-800 mr-3" size={24} />
      <span className="text-gray-700">{folder.name}</span>
    </button>
  );
};