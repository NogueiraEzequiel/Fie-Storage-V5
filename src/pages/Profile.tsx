import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileDialog } from '../components/ProfileDialog';
import { FileActivity } from '../components/FileActivity'; // Importar FileActivity

export const Profile = () => {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!currentUser) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setProfileData(userDoc.data());
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [currentUser]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !event.target.files?.[0]) return;

    setUploadingPhoto(true);
    try {
      const file = event.target.files[0];
      const photoRef = ref(storage, `profile-photos/${currentUser.uid}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL
      });

      setProfileData((prev: any) => ({
        ...prev,
        photoURL
      }));
    } catch (error) {
      console.error('Error al subir la foto:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateProfile = async (firstName: string, lastName: string) => {
    if (!currentUser) return;

    setLoading(true);
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
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error al actualizar el perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  if (!currentUser || !profileData) {
    return <div>No hay datos de perfil disponibles</div>;
  }

  return (
    <div className="max-w-full mx-auto bg-white rounded-lg shadow-sm overflow-auto">
      <ProfileHeader
        user={currentUser}
        profileData={profileData}
        userRole={userRole}
        onPhotoUpload={handlePhotoUpload}
        uploadingPhoto={uploadingPhoto}
        showUploadButton={false} // Controlar la visibilidad del botón de subir foto
      />

      <div className="p-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Nombre:</span> {profileData.firstName} {profileData.lastName}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Correo Electrónico:</span> {currentUser.email}
          </p>
          {profileData.department && (
            <p className="text-gray-600">
              <span className="font-medium">Departamento:</span> {profileData.department}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
      >
        Editar Perfil
      </button>

      <div className="p-6 border-t">
        {userRole && <FileActivity userId={currentUser.uid} userRole={userRole} />}
      </div>

      <ProfileDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onUpdateProfile={handleUpdateProfile}
        user={currentUser}
        profileData={profileData}
        onPhotoUpload={handlePhotoUpload}
        uploadingPhoto={uploadingPhoto}
        userRole={userRole}
      />
    </div>
  );
};
