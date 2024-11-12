import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // Importamos solo lo necesario
import { db } from '../lib/firebase'; // Importamos solo lo necesario
import { User, Camera, X } from 'lucide-react'; // Iconos necesarios

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profileData: any;
  onUpdateProfile: (firstName: string, lastName: string) => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingPhoto: boolean;
  userRole: string | null;
}

export const ProfileDialog = ({
  isOpen,
  onClose,
  user,
  profileData,
  onUpdateProfile,
  onPhotoUpload,
  uploadingPhoto,
}: ProfileDialogProps) => {
  const [firstName, setFirstName] = useState(profileData?.firstName || '');
  const [lastName, setLastName] = useState(profileData?.lastName || '');
  const [photoURL, setPhotoURL] = useState(profileData?.photoURL || '');

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setPhotoURL(data.photoURL || '');
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error);
      }
    };

    if (isOpen) {
      loadProfile();
    }
  }, [user, isOpen]);

  const handleUpdateProfile = () => {
    onUpdateProfile(firstName, lastName);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Configuración de Perfil</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Perfil"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={48} className="text-gray-400" />
                </div>
              )}
              <label className="absolute bottom-0 right-0 p-2 bg-blue-800 text-white rounded-full cursor-pointer hover:bg-blue-900 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={onPhotoUpload}
                  disabled={uploadingPhoto}
                />
                <Camera size={20} />
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-800 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-800 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full p-2 border rounded bg-gray-50"
            />
          </div>

          <button
            onClick={handleUpdateProfile}
            className="w-full py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
          >
            Actualizar Perfil
          </button>
        </div>
      </div>
    </div>
  );
};
