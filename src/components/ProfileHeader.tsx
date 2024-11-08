import { User } from 'lucide-react';
import { UserRole } from '../types';

interface ProfileHeaderProps {
  user: any;
  profileData: any;
  userRole: UserRole | null;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  uploadingPhoto: boolean;
  showUploadButton?: boolean; // Añadir esta propiedad opcional
}

const getRoleInSpanish = (role: UserRole | null) => {
  switch (role) {
    case 'student':
      return 'Estudiante';
    case 'teacher':
      return 'Profesor';
    case 'admin':
      return 'Administrador';
    default:
      return 'Usuario';
  }
};

export const ProfileHeader = ({
  profileData,
  userRole,
  onPhotoUpload,
  uploadingPhoto,
  showUploadButton = true // Valor por defecto: mostrar el botón
}: ProfileHeaderProps) => {
  return (
    <div className="p-6">
      <div className="flex items-start space-x-6">
        <div className="relative">
          {profileData.photoURL ? (
            <img
              src={profileData.photoURL}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={40} className="text-gray-400" />
            </div>
          )}
          {showUploadButton && (
            <label
              className={`absolute bottom-0 right-0 bg-blue-800 text-white p-2 rounded-full cursor-pointer
              hover:bg-blue-900 transition-colors ${uploadingPhoto ? 'opacity-50' : ''}`}
            >
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onPhotoUpload}
                disabled={uploadingPhoto}
              />
              <User size={16} />
            </label>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {profileData.firstName} {profileData.lastName}
          </h1>
          <p className="text-gray-500 capitalize">{getRoleInSpanish(userRole)}</p>
          {profileData.bio && (
            <p className="mt-2 text-gray-600">{profileData.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
};
