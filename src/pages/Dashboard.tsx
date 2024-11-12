import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listFiles, deleteFile, createFolder, renameFolder, removeFolder } from '../utils/storage';
import { FileItem, FolderItem, FileMetadata } from '../types';
import { useAuth } from '../contexts/AuthContext'; // Importa el contexto de autenticación
import { CommentModal } from '../components/CommentModal';
import { FolderManagementDialog } from '../components/FolderManagementDialog';
import { Breadcrumb } from '../components/Breadcrumb';
import { FolderCard } from '../components/FolderCard';
import { FileCard } from '../components/FileCard';
import { HardHat, Settings, UserRoundCog, FolderPlus } from 'lucide-react'; // Eliminamos los íconos no utilizados
import { AdminFilters } from '../components/AdminFilters'; // Importa el componente AdminFilters
import { UserManagement } from '../components/UserManagement'; // Importa el componente de administración de usuarios
import { doc, getDoc, setDoc } from 'firebase/firestore'; // Volvemos a importar setDoc para la creación de documentos
import { db } from '../lib/firebase'; // Importa la instancia de Firestore

export const Dashboard = () => {
  const { '*': currentPathParam = '' } = useParams();
  const currentPath = currentPathParam ? currentPathParam.replace(/^files\//, '') : '';  // Eliminar 'files/' de currentPath
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth(); // Obtener el usuario actual y su rol del contexto de autenticación

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>(''); // Estado para la carrera seleccionada
  const [filteredFolders, setFilteredFolders] = useState<FolderItem[]>([]); // Estado para carpetas filtradas
  const [careers, setCareers] = useState<any>({}); // Estado para almacenar las carreras disponibles
  const [showAdminFilters, setShowAdminFilters] = useState(false); // Estado para controlar la visibilidad del menú de Admin
  const [showUserManagement, setShowUserManagement] = useState(false); // Estado para controlar la visibilidad del menú de administración de usuarios

  const loadContent = async () => {
    if (!currentUser) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { items, folders } = await listFiles(`files/${currentPath}`);
      const formattedItems = items.map(item => ({
        ...item,
        metadata: {
          ...item.metadata,
          id: item.id,
          name: item.name,
          path: item.fullPath.replace(/^files\//, ''), 
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
      setFolders(folders.map(folder => ({
        ...folder,
        fullPath: folder.fullPath.replace(/^files\//, '')  
      })));
      setFilteredFolders(folders.map(folder => ({
        ...folder,
        fullPath: folder.fullPath.replace(/^files\//, '')  
      }))); 
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadContent();
  }, [currentUser, currentPath]);

  useEffect(() => {
    const loadCareers = async () => {
      const docRef = doc(db, 'config', 'careers');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCareers(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };
    loadCareers();
  }, []);

  const handleFolderClick = (path: string) => {
    navigate(`/folder/${path}`);
  };

  const handleDeleteFile = async (file: FileItem) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(file.fullPath, file.id);
      await loadContent();
    } catch {
      setError('Failed to delete file');
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    if (!currentUser || userRole !== 'admin') {
      setError('User is not authenticated or is not an admin.');
      return;
    }
    try {
      if (!currentPath && folderName === 'files') return;
      await createFolder(`files/${currentPath}`, folderName);
      await loadContent();
    } catch {
      setError('Failed to create folder');
    }
  };

  const handleRenameFolder = async (newName: string) => {
    if (!folderToRename || !currentUser || userRole !== 'admin') {
      setError('User is not authenticated or is not an admin or no folder selected.');
      return;
    }
    try {
      await renameFolder(`files/${currentPath}`, folderToRename, newName);
      await loadContent();
    } catch {
      setError('Failed to rename folder');
    } finally {
      setFolderToRename(null);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderToDelete || !currentUser || userRole !== 'admin') {
      setError('User is not authenticated or is not an admin or no folder selected.');
      return;
    }
    if (!confirm(`Are you sure you want to delete the folder "${folderToDelete}"?`)) {
      setFolderToDelete(null);
      return;
    }
    try {
      await removeFolder(`files/${folderToDelete}`);
      await loadContent();
    } catch {
      setError('Failed to delete folder');
    } finally {
      setFolderToDelete(null);
    }
  };

  // Función para manejar el cambio de carrera seleccionada
  const handleCareerChange = (career: string) => {
    setSelectedCareer(career);
    if (career && careers[career]) {
      const visibleFolders = folders.filter(folder => careers[career].Materias[folder.name]);
      setFilteredFolders(visibleFolders);
    } else {
      setFilteredFolders(folders); 
    }
  };

  // Función para manejar la visibilidad del menú AdminFilters
  const toggleAdminFilters = () => {
    setShowAdminFilters(!showAdminFilters);
  };

  // Función para manejar la visibilidad del menú de Administración de Usuarios
  const toggleUserManagement = () => {
    setShowUserManagement(!showUserManagement);
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
          <div className="flex gap-2 items-center">
            {currentUser && userRole === 'admin' && (
              <>
                {/* Botón de Crear Carpeta */}
                <button
                  onClick={() => setShowCreateFolderDialog(true)}
                  className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
                >
                  Crear Carpeta
                  <FolderPlus className="w-6 h-6" />
                </button>
                {/* Botón para Mostrar/Ocultar AdminFilters */}
                <button
                  onClick={toggleAdminFilters}
                  className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
                >
                  <Settings className="w-6 h-6" />
                  Carreras
                </button>
                {/* Botón para Mostrar/Ocultar UserManagement */}
                <button
                  onClick={toggleUserManagement}
                  className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
                >
                  <UserRoundCog className="w-6 h-6" />
                  Usuarios
                </button>
              </>
            )}
            {/* Menú Desplegable para Seleccionar Carrera */}
            <div className="relative flex items-center gap-2">
              <select
                value={selectedCareer}
                onChange={(e) => handleCareerChange(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500 flex items-center"
              >
                <option value="">Seleccionar Carrera</option>
                {Object.keys(careers).map(career => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
              <HardHat className="w-6 h-6 text-blue-800 absolute right-2" /> {/* Ícono dentro del select */}
            </div>
          </div>
        </div>

        {showAdminFilters && (
          <div className="p-4">
            <AdminFilters onToggleSubject={() => {}} /> {/* No necesitamos marcar cambios pendientes aquí */}
          </div>
        )}

        {showUserManagement && (
          <div className="p-4">
            <UserManagement />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg-grid-cols-3 gap-4">
          {filteredFolders.map((folder) => (
            <FolderCard
              key={folder.fullPath}
              folder={folder}
              onClick={() => handleFolderClick(folder.fullPath.replace(/^files\//, ''))}
              onRename={() => userRole === 'admin' && setFolderToRename(folder.name)}
              onDelete={() => userRole === 'admin' && setFolderToDelete(folder.fullPath.replace(/^files\//, ''))}
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
