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
import { HardHat, Settings, UserRoundCog, FolderPlus, UploadCloud } from 'lucide-react'; // Añadimos el icono UploadCloud
import { AdminFilters } from '../components/AdminFilters'; // Importa el componente AdminFilters
import { UserManagement } from '../components/UserManagement'; // Importa el componente de administración de usuarios
import { doc, getDoc } from 'firebase/firestore'; // Volvemos a importar setDoc para la creación de documentos
import { db } from '../lib/firebase'; // Importa la instancia de Firestore
import { FileUploadButton } from '../components/FileUploadButton'; // Importa el componente FileUploadButton

export const Dashboard = () => {
  const { '*': currentPathParam = '' } = useParams();
  const currentPath = currentPathParam ? currentPathParam : '';  // Comienza desde la raíz directamente
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth(); // Obtener el usuario actual y su rol del contexto de autenticación

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [, setFolders] = useState<FolderItem[]>([]); // Declaramos `folders` pero la usamos correctamente más adelante
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
  const [showUpload, setShowUpload] = useState(false); // Estado para mostrar/ocultar el componente de carga de archivos

  const loadContent = async () => {
    if (!currentUser) {
      setError('User is not authenticated.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { items, folders } = await listFiles(currentPath); // Listar archivos desde la ruta actual
      const filteredFolders = folders.filter(folder => !folder.name.includes('profile-photos')); // Filtrar carpetas innecesarias
      const formattedItems = items.map(item => ({
        ...item,
        metadata: {
          ...item.metadata,
          id: item.id,
          name: item.name,
          path: item.fullPath, 
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
      setFolders(filteredFolders); // Ahora se usa `setFolders` correctamente para evitar la advertencia
      setFilteredFolders(filteredFolders); 
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
    if (!currentUser || (userRole !== 'admin' && userRole !== 'student')) {
      setError('User is not authenticated or is not authorized.');
      return;
    }
    try {
      if (!currentPath && folderName === 'files') return;
      await createFolder(currentPath, folderName);
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
      await renameFolder(currentPath, folderToRename, newName);
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
      await removeFolder(folderToDelete);
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
    setShowUpload(false); // Ocultar el área de carga de archivos al cambiar de carrera
    navigate('/'); // Navegar a la raíz de Firebase Storage
  };

  // Función para manejar la visibilidad del menú AdminFilters
  const toggleAdminFilters = () => {
    setShowAdminFilters(!showAdminFilters);
  };

  // Función para manejar la visibilidad del menú de Administración de Usuarios
  const toggleUserManagement = () => {
    setShowUserManagement(!showUserManagement);
  };

  // Función para manejar la visibilidad del componente de carga de archivos
  const toggleUpload = () => {
    setShowUpload(!showUpload);
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
            {/* Menú Desplegable para Seleccionar Carrera */}
            <div className="relative flex items-center gap-2 order-last">
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
            {currentUser && userRole === 'student' && paths.length >= 2 && (
              // Botón para mostrar/ocultar componente de creación de carpetas
              <button
                onClick={() => setShowCreateFolderDialog(true)}
                className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
              >
                <FolderPlus className="w-6 h-6" />
                Crear Carpeta
              </button>
            )}
            {currentUser && userRole === 'student' && paths.length >= 3 && (
              // Botón para mostrar/ocultar componente de carga de archivos
              <button
                onClick={toggleUpload}
                className="px-4 py-2 rounded flex items-center gap-2 bg-blue-800 text-white"
              >
                <UploadCloud className="w-6 h-6" />
                {showUpload ? 'Cerrar Carga de Archivos' : 'Subir Archivos'}
              </button>
            )}
            {currentUser && userRole === 'admin' && (
              <>
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
          </div>
        </div>
        {showUpload && (
          <div className="p-4 border rounded-lg bg-gray-50 mt-4">
            <FileUploadButton
              currentPath={currentPath}
              career={selectedCareer}
              subject={paths.length > 1 ? paths[1] : ''}
              academicYear={paths.length > 2 ? paths[2] : ''}
              onUploadComplete={() => {
                setShowUpload(false); // Ocultar el área de carga después de subir
                loadContent(); // Recargar contenido
              }}
            />
          </div>
        )}
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
              onClick={() => handleFolderClick(folder.fullPath)}
              onRename={() => userRole === 'admin' && setFolderToRename(folder.name)}
              onDelete={() => userRole === 'admin' && setFolderToDelete(folder.fullPath)}
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
          fileId={selectedFile.id} // Nos aseguramos de que `fileId` se pasa correctamente
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedFile(null);
          }}
          currentGrade={selectedFile.grade} // Aseguramos que la calificación actual se está pasando
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
          initialFolderName={folderToRename || undefined} // Asegurar que no es null
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
