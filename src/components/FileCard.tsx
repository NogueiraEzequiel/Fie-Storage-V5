import { Download, MessageSquare, Star, Trash2, FileImage, FileText } from 'lucide-react';
import { FileItem } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface FileCardProps {
  file: FileItem;
  onDelete: (file: FileItem) => Promise<void>;
  onShowComments: (file: FileItem) => void;
}

export const FileCard = ({ file, onDelete, onShowComments }: FileCardProps) => {
  const { userRole } = useAuth();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileIcon = (fileType?: string) => {
    console.log("File type:", fileType); // Depuración
    if (fileType === 'image/jpeg') {
      return <FileImage size={50} className="text-blue-800" />; // Icono más grande para imágenes JPG
    }
    return <FileText size={24} className="text-blue-800" />; // Icono más grande para otros tipos de archivos
  };

  if (!file || !file.metadata) {
    console.error("Invalid file data:", file);
    return null;
  }

  console.log("Rendering file:", file);

  return (
    <div className="flex flex-col p-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="mr-3">
            {renderFileIcon(file.metadata.type)}
          </div>
          <div>
            <p className="font-medium text-gray-700">{file.name}</p>
            <p className="text-sm text-gray-500">
              Uploaded by {file.metadata.uploaderName}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(file.metadata.uploadedAt)} • {formatFileSize(file.metadata.size)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {file.metadata.grade && (
            <div className="flex items-center text-yellow-500">
              <Star size={16} className="mr-1" />
              <span className="text-sm font-medium">{file.metadata.grade.score}/10</span>
            </div>
          )}
          
          <button
            onClick={() => onShowComments(file)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MessageSquare size={20} />
          </button>

          <a
            href={file.downloadURL}
            download
            className="p-2 text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
          >
            <Download size={20} />
          </a>

          {userRole === 'admin' && (
            <button
              onClick={() => onDelete(file)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
