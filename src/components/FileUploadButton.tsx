import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

interface FileUploadButtonProps {
  currentPath: string;
  career: string;
  subject: string;
  academicYear: string;
  onUploadComplete: () => void;
}

export const FileUploadButton = ({ currentPath, career, subject, academicYear, onUploadComplete }: FileUploadButtonProps) => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!currentUser) return;

    setUploading(true);
    setUploadSuccess(false);
    setUploadError(false);
    try {
      for (const file of acceptedFiles) {
        const path = `${currentPath}/${file.name}`;
        const storageRef = ref(storage, path);

        // Subir archivo a Firebase Storage
        const snapshot = await uploadBytes(storageRef, file, {
          customMetadata: {
            uploadedBy: currentUser.email || '',
            career,
            subject,
            academicYear
          }
        });

        const downloadURL = await getDownloadURL(snapshot.ref);

        // Crear metadata del archivo en Firestore
        await addDoc(collection(db, 'studentWorks'), { 
          name: file.name,
          type: 'file',
          path,
          size: file.size,
          fileType: file.type,
          downloadURL,
          uploadedBy: currentUser.email,
          uploadedAt: new Date().toISOString(),
          career,
          subject,
          academicYear,
          comments: [],
          permissions: {
            read: [currentUser.uid],
            write: [currentUser.uid]
          }
        });
      }
      setUploadSuccess(true);
      onUploadComplete(); // Notificar que la carga se ha completado
    } catch (error) {
      console.error('Error al subir archivo:', error);
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-10 text-center text-blue-800">Subir Archivos</h2>
      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-8
          ${isDragActive ? 'border-blue-900 bg-blue-50' : 'border-gray-400 hover:border-blue-900'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-blue-800 mb-4" size={60} />
        {isDragActive ? (
          <p className="text-blue-800 font-semibold">Suelta los archivos aquí...</p>
        ) : (
          <p className="text-gray-700">
            Arrastra y suelta archivos aquí, o haz clic para seleccionar archivos
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">Tamaño máximo de archivo: 100MB</p>
      </div>

      {uploading && (
        <div className="mt-4 text-center text-gray-700">
          Subiendo archivos...
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 text-center text-green-600 flex items-center justify-center">
          <CheckCircle size={24} className="mr-2" /> ¡Archivo subido con éxito!
        </div>
      )}

      {uploadError && (
        <div className="mt-4 text-center text-red-600 flex items-center justify-center">
          <XCircle size={24} className="mr-2" /> Error al subir el archivo. Por favor, intenta nuevamente.
        </div>
      )}
    </div>
  );
};
