import React, { useState, useEffect } from 'react';

interface FolderManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (folderName: string) => void;
  onRenameFolder?: (newName: string) => void;
  initialFolderName?: string;
}

export const FolderManagementDialog: React.FC<FolderManagementDialogProps> = ({ isOpen, onClose, onCreateFolder, onRenameFolder, initialFolderName }) => {
  const [folderName, setFolderName] = useState(initialFolderName || '');

  useEffect(() => {
    if (isOpen) {
      setFolderName(initialFolderName || '');
    }
  }, [isOpen, initialFolderName]);

  const handleSubmit = () => {
    if (onRenameFolder) {
      onRenameFolder(folderName);
    } else {
      onCreateFolder(folderName);
    }
    onClose();
  };

  return (
    <div className={`fixed inset-0 flex items-center justify-center ${isOpen ? 'visible' : 'invisible'} bg-black bg-opacity-50`}>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{onRenameFolder ? 'Rename Folder' : 'Create Folder'}</h2>
        <input
          type="text"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg mb-4"
          placeholder="Folder Name"
        />
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
            Cancel
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            {onRenameFolder ? 'Rename' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};
