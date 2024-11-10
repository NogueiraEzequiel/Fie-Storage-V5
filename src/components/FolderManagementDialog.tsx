import React, { useState } from 'react';
import { createFolder } from '../utils/storage';
import { Dialog, Transition } from '@headlessui/react';

interface FolderManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

export const FolderManagementDialog = ({ isOpen, onClose, currentPath }: FolderManagementDialogProps) => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    console.log('Creating folder with path:', currentPath, 'and folder name:', folderName);

    if (!folderName) {
      setError('Folder name cannot be empty');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createFolder(currentPath, folderName);
      setFolderName('');
      onClose(); // Cierra el diálogo al crear la carpeta
    } catch (err: any) {
      setError(err.message || 'Failed to create folder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mt-3 text-center sm:mt-5">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                    Create New Folder
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Folder Name"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                    />
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCreateFolder}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
