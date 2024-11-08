import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Settings, Folder } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, deleteFile } from '../utils/storage';
import { doc, updateDoc } from 'firebase/firestore'; // Importar doc y updateDoc
import { db } from '../lib/firebase'; // Importar db
import { FileUploadButton } from '../components/FileUploadButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { FolderManagementDialog } from '../components/FolderManagementDialog';
import { UserManagement } from '../components/UserManagement';
import { ProfileDialog } from '../components/ProfileDialog';
import { CommentModal } from '../components/CommentModal';
import { FileCard } from '../components/FileCard';
import { FolderCard } from '../components/FolderCard';
import { useSpring, animated } from '@react-spring/web';
import { FileItem, FileMetadata } from '../types';

export const Dashboard = () => {
  const { currentPath = '' } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <p className="font-medium">User not authenticated</p>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [showFolderManagement, setShowFolderManagement] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const buttonSpring = useSpring({
    from: { backgroundColor: 'rgb(30, 64, 175)' },
    to: {
      backgroundColor: 'rgb(30, 64, 175)',
      color: 'white',
    },
    config: { duration: 200 }
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const { items, folders } = await listFiles(currentPath);
      const formattedItems = items.map((item) => ({
        ...item,
        metadata: {
          ...item.metadata,
          id: item.id,
          name: item.name,
          path: item.fullPath,
          size: item.metadata.size,
          type: item.metadata.type,
          uploadedBy: item.metadata.uploadedBy,
          uploaderName: item.metadata.uploaderName,
          career: item.metadata.career,
          subject: item.metadata.subject,
          academicYear: item.metadata.academicYear,
          comments: item.metadata.comments,
          uploadedAt: item.metadata.uploadedAt
        }
      }));
      setFiles(formattedItems);
      setFolders(folders);
    } catch (err: any) {
      setError(err.message || 'Failed to load content');
      console.error('Error loading content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
  
  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    if (!currentUser) return;

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`
      });

      setProfileData((prev: any) => ({
        ...prev,
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`
      }));
      setShowProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
  const isRoot = paths.length === 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Breadcrumb paths={paths} onNavigate={handleFolderClick} />
        <div className="flex gap-2">
          <animated.button
            style={buttonSpring}
            onClick={() => setShowProfile(true)}
            className="px-4 py-2 rounded flex items-center gap-2"
          >
            <User size={20} />
            Profile
          </animated.button>
          {(userRole === 'teacher' || userRole === 'admin') && (
            <animated.button
              style={buttonSpring}
              onClick={() => setShowFolderManagement(true)}
              className="px-4 py-2 rounded flex items-center gap-2"
            >
              <Folder size={20} />
              Manage Folders
            </animated.button>
          )}
          {userRole === 'admin' && isRoot && (
            <animated.button
              style={buttonSpring}
              onClick={() => navigate('/admin')}
              className="px-4 py-2 rounded flex items-center gap-2"
            >
              <Settings size={20} />
              Admin Panel
            </animated.button>
          )}
        </div>
      </div>
      {showProfile && (
        <ProfileDialog
          isOpen={showProfile}
          onClose={() => setShowProfile(false)}
          user={currentUser}
          profileData={profileData}
          onUpdateProfile={handleUpdateProfile}
          onPhotoUpload={() => {}} // Agregar esta propiedad
          uploadingPhoto={false} // Agregar esta propiedad
          userRole={userRole}
        />
      )}
      {showFolderManagement && (
        <FolderManagementDialog
          isOpen={showFolderManagement}
          onClose={() => setShowFolderManagement(false)}
        />
      )}

      {userRole === 'admin' && isRoot && <UserManagement />}
      {userRole === 'student' && !isRoot && (
        <FileUploadButton
          career={paths[0] || ''}
          subject={paths[1] || ''}
          academicYear={paths[2] || ''}
          onUploadComplete={loadContent}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <FolderCard
            key={folder.fullPath}
            folder={folder}
            onClick={handleFolderClick}
          />
        ))}

        {files.map((file) => (
          <FileCard
            key={file.fullPath}
            file={file}
            onDelete={handleDeleteFile}
            onShowComments={(file) => {
              setSelectedFile(file.metadata);
              setShowComments(true);
            }}
          />
        ))}
      </div>
      {folders.length === 0 && files.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>This folder is empty</p>
        </div>
      )}

      {selectedFile && (
        <CommentModal
          fileId={selectedFile.id}
          isOpen={showComments}
          onClose={() => {
            setShowComments(false);
            setSelectedFile(null);
          }}
          currentGrade={selectedFile.grade}
          canEdit={userRole === 'teacher' || userRole === 'admin'}
        />
      )}
    </div>
  );
};
