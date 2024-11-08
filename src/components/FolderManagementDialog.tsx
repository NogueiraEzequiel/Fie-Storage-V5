import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '../lib/firebase';

interface FolderManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderManagementDialog = ({ isOpen, onClose }: FolderManagementDialogProps) => {
  const { userRole } = useAuth();
  const [newFolderName, setNewFolderName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || (userRole !== 'teacher' && userRole !== 'admin')) {
    return null;
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      setError(null);
      const folderRef = ref(storage, `files/${newFolderName}`);
      
      // Create an empty file to represent the folder
      const emptyBlob = new Blob([], { type: 'application/json' });
      await uploadBytes(folderRef, emptyBlob);
      
      setNewFolderName('');
      onClose();
    } catch (error: any) {
      console.error('Error creating folder:', error);
      setError(error.message || 'Failed to create folder');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Folders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="New folder name"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleCreateFolder}
            className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Create
          </button>
        </div>
      </div>
    </div>
  );
};