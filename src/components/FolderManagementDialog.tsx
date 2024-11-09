import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash, Download, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createFolder, renameFolder, deleteFolder, listFolders } from '../utils/folderCrud';
import { FolderItem } from '../types';

interface FolderManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export const FolderManagementDialog = ({ isOpen, onClose, currentPath }: FolderManagementDialogProps) => {
  const { userRole } = useAuth();
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFolderName, setRenameFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<FolderItem | null>(null);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen && currentPath) {
      const loadFolders = async () => {
        try {
          const folderItems = await listFolders(currentPath);
          setFolders(folderItems);
        } catch (error) {
          console.error('Error loading folders:', error);
          setError('Failed to load folders');
        }
      };
      loadFolders();
    }
  }, [isOpen, currentPath]);

  if (!isOpen || userRole === 'student') {
    return null;
  }
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !currentPath) return;

    try {
      setError(null);
      console.log('Creating folder:', `${currentPath}/${newFolderName}`, 'with name:', newFolderName);
      await createFolder(`${currentPath}/${newFolderName}`, newFolderName);
      setNewFolderName('');
      const folderItems = await listFolders(currentPath);
      setFolders(folderItems);
    } catch (error: any) {
      console.error('Error creating folder:', error);
      setError(error.message || 'Failed to create folder');
    }
  };

  const handleRenameFolder = async (folder: FolderItem) => {
    if (!renameFolderName.trim()) return;

    try {
      setError(null);
      await renameFolder(folder.fullPath, renameFolderName);
      setRenameFolderName('');
      const folderItems = await listFolders(currentPath);
      setFolders(folderItems);
    } catch (error: any) {
      console.error('Error renaming folder:', error);
      setError(error.message || 'Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (folder: FolderItem) => {
    setSelectedFolder(folder);

    try {
      await deleteFolder(folder.fullPath);
      const folderItems = await listFolders(currentPath);
      setFolders(folderItems);
      setSelectedFolder(null);
      setIsDeleting(false);
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      setError(error.message || 'Failed to delete folder');
    }
  };

  const confirmDeleteFolder = async () => {
    if (!selectedFolder) return;
    try {
      await deleteFolder(selectedFolder.fullPath);
      const folderItems = await listFolders(currentPath);
      setFolders(folderItems);
      setIsDeleting(false);
      setSelectedFolder(null);
    } catch (error: any) {
      console.error('Error deleting folder:', error);
      setError(error.message || 'Failed to delete folder');
    }
  };
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage Folders</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded">
            {error}
          </div>
        )}
        
        {userRole === 'admin' && (
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New folder name"
              className="flex-1 p-2 border rounded"
            />
            <button onClick={handleCreateFolder} className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors flex items-center gap-2">
              <Plus size={20} />
              Create
            </button>
          </div>
        )}

        <div className="space-y-2">
          {folders.map(folder => (
            <div key={folder.fullPath} className="flex justify-between items-center p-2 border rounded hover:bg-gray-100 transition">
              <span>{folder.name}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleRenameFolder(folder)} className="text-blue-600 hover:text-blue-800">
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteFolder(folder)} className="text-red-600 hover:text-red-800">
                  <Trash size={16} />
                </button>
                <button className="text-green-600 hover:text-green-800">
                  <Download size={16} />
                </button>
                <button className="text-yellow-600 hover:text-yellow-800">
                  <MessageCircle size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {isDeleting && selectedFolder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <p className="mt-4">Are you sure you want to delete the folder "{selectedFolder.name}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={confirmDeleteFolder} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                <button onClick={() => setIsDeleting(false)} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
