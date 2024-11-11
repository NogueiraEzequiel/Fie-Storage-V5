import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listFiles, deleteFile, createFolder, renameFolder, removeFolder } from '../utils/storage';
import { FileItem, FolderItem, FileMetadata } from '../types';
// Eliminar importación innecesaria
// import { ContentPanel } from '../components/ContentPanel';
import { CommentModal } from '../components/CommentModal';
import { FolderManagementDialog } from '../components/FolderManagementDialog';
import { Breadcrumb } from '../components/Breadcrumb';
import { FolderCard } from '../components/FolderCard';
import { FileCard } from '../components/FileCard';

export const Dashboard = () => {
  const { '*': currentPathParam = '' } = useParams();
  const currentPath = currentPathParam ? currentPathParam.replace(/^files\//, '') : '';  // Eliminar 'files/' de currentPath
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null); // Nuevo estado para la carpeta a eliminar

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading content for path:', currentPath);
      const { items, folders } = await listFiles(`files/${currentPath}`);
      const formattedItems = items.map((item) => ({
        ...item,
        metadata: {
          ...item.metadata,
          id: item.id,
          name: item.name,
          path: item.fullPath.replace(/^files\//, ''),  // Eliminar 'files/' de path
          size: item.metadata?.size || 0,
          type: item.metadata?.type,
          uploadedBy: item.metadata?.uploadedBy,
          uploaderName: item.metadata?.uploaderName,
          career: item.metadata?.career,
          subject: item.metadata?.subject,
          academicYear: item.metadata?.academicYear,
          comments: item.metadata?.comments,
          uploadedAt: item.metadata?.uploadedAt
        }
      }));
      setFiles(formattedItems);
      setFolders(folders.map((folder) => ({
        ...folder,
        fullPath: folder.fullPath.replace(/^files\//, '')  // Eliminar 'files/' de fullPath
      })));
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current Path:', currentPath);
    loadContent();
  }, [currentPath]);

  const handleFolderClick = (path: string) => {
    navigate(`/folder/${path}`);
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await deleteFile(file.fullPath, file.id);
      await loadContent();
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Failed to delete file');
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      if (!currentPath && folderName === 'files') {
        console.warn('Cannot create folder with name "files" in the root.');
        return;
      }
      console.log('Creating folder with path:', currentPath, 'and folder name:', folderName);
      await createFolder(`files/${currentPath}`, folderName);
      await loadContent();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };

  const handleRenameFolder = async (newName: string) => {
    if (!folderToRename) return;
    try {
      console.log(`Renaming folder from ${folderToRename} to ${newName} in path ${currentPath}`);
      await renameFolder(currentPath, folderToRename, newName);
      await loadContent();
    } catch (error) {
      console.error('Error renaming folder:', error);
      setError('Failed to rename folder');
    } finally {
      setFolderToRename(null);
    }
  };

  const handleDeleteFolder = async () => {
    if (!confirm(`Are you sure you want to delete the folder "${folderToDelete}"?`)) {
      setFolderToDelete(null);
      return;
    }

    try {
      await removeFolder(`files/${folderToDelete}`);
      await loadContent();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder');
    } finally {
      setFolderToDelete(null);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        <p className="font-medium">Error loading content</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  const paths = currentPath ? currentPath.split('/') : [];

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center p-4">
          <Breadcrumb paths={paths} onNavigate={handleFolderClick} />
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateFolderDialog(true)}
              className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
            >
              Crear Carpeta
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {folders.map((folder) => (
            <FolderCard
              key={folder.fullPath}
              folder={folder}
              onClick={() => handleFolderClick(folder.fullPath.replace(/^files\//, ''))}
              onRename={() => setFolderToRename(folder.name)}
              onDelete={() => setFolderToDelete(folder.fullPath.replace(/^files\//, ''))}
            />
          ))}
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleDeleteFile}
              onShowComments={() => {
                setSelectedFile(file.metadata as FileMetadata);
                setShowComments(true);
              }}
            />
          ))}
        </div>
      </div>

      {selectedFile && (
        <CommentModal
          fileId={selectedFile.id}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedFile(null);
          }}
          currentGrade={selectedFile.grade}
          canEdit={true}
        />
      )}

      {folderToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete the folder "{folderToDelete}"?</p>
            <div className="flex justify-end gap-4 mt-4">
              <button onClick={() => setFolderToDelete(null)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">
                Cancel
              </button>
              <button onClick={handleDeleteFolder} className="px-4 py-2 bg-red-600 text-white rounded">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {folderToRename && (
        <FolderManagementDialog
          isOpen={!!folderToRename}
          onClose={() => setFolderToRename(null)}
          onCreateFolder={handleCreateFolder}
          onRenameFolder={handleRenameFolder} // Asegurar que handleRenameFolder se pasa correctamente
          initialFolderName={folderToRename} // Pasar el nombre inicial para renombrar
        />
      )}

      <FolderManagementDialog
        isOpen={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
};

export default Dashboard;
