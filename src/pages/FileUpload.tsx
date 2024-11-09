import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upload, CheckCircle, XCircle } from 'lucide-react';
import { Filters } from '../components/Filters';

export const FileUpload = () => {
  const { currentUser } = useAuth();
  const [career, setCareer] = useState('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
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
        const path = `${career}/${subject}/${academicYear}/${file.name}`;
        const storageRef = ref(storage, path);

        // Upload file to Firebase Storage
        const snapshot = await uploadBytes(storageRef, file, {
          customMetadata: {
            uploadedBy: currentUser.email || '',
            career,
            subject,
            academicYear
          }
        });

        const downloadURL = await getDownloadURL(snapshot.ref);

        // Create file metadata in Firestore
        await addDoc(collection(db, 'studentWorks'), { // Cambiado a 'studentWorks'
          name: file.name,
          type: 'file', // Indicar que es un archivo
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
          permissions: { // Añadir permisos básicos
            read: [currentUser.uid],
            write: [currentUser.uid]
          }
        });
      }
      setUploadSuccess(true);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError(true);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="max-w-4xl mx-auto p-10 bg-white rounded-lg shadow-lg">
      <h2 className="text-4xl font-bold mb-10 text-center text-blue-800">Upload Files</h2>

      <div className="mb-12">
        <Filters
          onCareerChange={setCareer}
          onSubjectChange={setSubject}
          onYearChange={setAcademicYear}
          selectedCareer={career}
          selectedSubject={subject}
          selectedYear={academicYear}
        />
      </div>

      <div
        {...getRootProps()}
        className={`border-4 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors mb-8
          ${isDragActive ? 'border-blue-900 bg-blue-50' : 'border-gray-400 hover:border-blue-900'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-blue-800 mb-4" size={60} />
        {isDragActive ? (
          <p className="text-blue-800 font-semibold">Drop the files here...</p>
        ) : (
          <p className="text-gray-700">
            Drag and drop files here, or click to select files
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">Maximum file size: 100MB</p>
      </div>

      {uploading && (
        <div className="mt-4 text-center text-gray-700">
          Uploading files...
        </div>
      )}

      {uploadSuccess && (
        <div className="mt-4 text-center text-green-600 flex items-center justify-center">
          <CheckCircle size={24} className="mr-2" /> File uploaded successfully!
        </div>
      )}

      {uploadError && (
        <div className="mt-4 text-center text-red-600 flex items-center justify-center">
          <XCircle size={24} className="mr-2" /> Error uploading file. Please try again.
        </div>
      )}
    </div>
  );
};
