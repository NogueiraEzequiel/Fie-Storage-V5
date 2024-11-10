import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { listFiles, deleteFile, createFolder, renameFolder, removeFolder } from '../utils/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileUploadButton } from '../components/FileUploadButton';
import { Breadcrumb } from '../components/Breadcrumb';
import { ContentPanel } from '../components/ContentPanel';
import { UserManagement } from '../components/UserManagement';
import { ProfileDialog } from '../components/ProfileDialog';
import { CommentModal } from '../components/CommentModal';
import { FolderManagementDialog } from '../components/FolderManagementDialog';
import { useSpring, animated } from '@react-spring/web';
import { FileItem, FileMetadata, FolderItem } from '../types';
import { AdminFilters } from '../components/AdminFilters';

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
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [folderToRename, setFolderToRename] = useState<string | null>(null);
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
      console.log('Loading content for path:', currentPath);
      const { items, folders } = await listFiles(currentPath);
      const formattedItems = items.map((item) => ({
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
      setFolders(folders);
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
      await createFolder(currentPath, folderName);
      await loadContent();
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };

  const handleRenameFolder = async (oldName: string, newName: string) => {
    try {
      await renameFolder(currentPath, oldName, newName);
      await loadContent();
    } catch (error) {
      console.error('Error renaming folder:', error);
      setError('Failed to rename folder');
    }
  };

  const handleDeleteFolder = async (path: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return;

    try {
      await removeFolder(path);
      await loadContent();
    } catch (error) {
      console.error('Error deleting folder:', error);
      setError('Failed to delete folder');
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

  const toggleUserManagement = () => {
    setShowUserManagement((prev) => !prev);
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
    <div className="flex min-h-screen">
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center p-4">
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
            {userRole === 'admin' && (
              <animated.button
                style={buttonSpring}
                onClick={toggleUserManagement}
                className="px-4 py-2 rounded flex items-center gap-2"
              >
                <Settings size={20} />
                Administración de usuarios
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
            onPhotoUpload={() => {}}
            uploadingPhoto={false}
            userRole={userRole}
          />
        )}

        {userRole === 'admin' && showUserManagement && <UserManagement />}
        {userRole === 'admin' && isRoot && <AdminFilters />}
        {userRole === 'student' && !isRoot && (
          <FileUploadButton
            career={paths[0] || ''}
            subject={paths[1] || ''}
            academicYear={paths[2] || ''}
            onUploadComplete={loadContent}
          />
        )}

        <ContentPanel
          currentPath={currentPath}
          files={files}
          folders={folders}
          onFileClick={(file: FileItem) => { /* lógica para manejar archivos */ }}
          onFolderClick={handleFolderClick}
          onDeleteFile={handleDeleteFile}
          onCommentClick={(file: FileItem) => {
            setSelectedFile(file.metadata as FileMetadata);
            setShowComments(true);
          }}
        />
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
          canEdit={userRole === 'teacher' || userRole === 'admin'}
        />
      )}

      <FolderManagementDialog
        isOpen={showCreateFolderDialog}
        onClose={() => setShowCreateFolderDialog(false)}
        currentPath={currentPath}
      />
    </div>
  );
};
