import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebase';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileDialog } from '../components/ProfileDialog';
import { ActivityHistory } from '../components/ActivityHistory';

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
        console.error('Error loading profile:', error);
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
      console.error('Error uploading photo:', error);
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
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (!currentUser || !profileData) {
    return <div>No profile data available</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm">
      <ProfileHeader
        user={currentUser}
        profileData={profileData}
        userRole={userRole}
        onPhotoUpload={handlePhotoUpload}
        uploadingPhoto={uploadingPhoto}
        showUploadButton={false} // Controlar la visibilidad del botón de subir foto
      />

      <div className="p-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="space-y-2">
          <p className="text-gray-600">
            <span className="font-medium">Name:</span> {profileData.firstName} {profileData.lastName}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {currentUser.email}
          </p>
          {profileData.department && (
            <p className="text-gray-600">
              <span className="font-medium">Department:</span> {profileData.department}
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsDialogOpen(true)}
        className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
      >
        Edit Profile
      </button>

      <ActivityHistory userId={currentUser.uid} />

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
