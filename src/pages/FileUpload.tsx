import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upload } from 'lucide-react';
import { Filters } from '../components/Filters';

export const FileUpload = () => {
  const { currentUser } = useAuth();
  const [career, setCareer] = useState('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = async (acceptedFiles: File[]) => {
    if (!currentUser) return;

    setUploading(true);
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
        await addDoc(collection(db, 'files'), {
          name: file.name,
          path,
          size: file.size,
          type: file.type,
          downloadURL,
          uploadedBy: currentUser.email,
          uploadedAt: new Date().toISOString(),
          career,
          subject,
          academicYear,
          comments: []
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Upload Files</h2>

      <Filters
        onCareerChange={setCareer}
        onSubjectChange={setSubject}
        onYearChange={setAcademicYear}
        selectedCareer={career}
        selectedSubject={subject}
        selectedYear={academicYear}
      />

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-800 bg-blue-50' : 'border-gray-300 hover:border-blue-800'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto text-gray-400 mb-4" size={48} />
        {isDragActive ? (
          <p className="text-blue-800">Drop the files here...</p>
        ) : (
          <p className="text-gray-600">
            Drag and drop files here, or click to select files
          </p>
        )}
      </div>

      {uploading && (
        <div className="mt-4 text-center text-gray-600">
          Uploading files...
        </div>
      )}
    </div>
  );
};
