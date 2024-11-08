import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../utils/storage';
import { Career, Subject, ACADEMIC_YEARS, ALLOWED_FILE_TYPES } from '../types';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FileUploadButtonProps {
  onUploadComplete: () => void;
  career: string;
  subject: string;
  academicYear: string;
}

export const FileUploadButton = ({ onUploadComplete, career, subject, academicYear }: FileUploadButtonProps) => {
  const { currentUser, userRole } = useAuth();
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCareer, setSelectedCareer] = useState(career);
  const [selectedSubject, setSelectedSubject] = useState(subject);
  const [selectedYear, setSelectedYear] = useState(academicYear);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCareers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'careers'));
        const careersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Career[];
        setCareers(careersData);
      } catch (err) {
        console.error('Error loading careers:', err);
        setError('Failed to load careers');
      }
    };

    loadCareers();
  }, []);

  useEffect(() => {
    const loadSubjects = async () => {
      if (!selectedCareer) {
        setSubjects([]);
        return;
      }

      try {
        const snapshot = await getDocs(collection(db, `careers/${selectedCareer}/subjects`));
        const subjectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Subject[];
        setSubjects(subjectsData);
      } catch (err) {
        console.error('Error loading subjects:', err);
        setError('Failed to load subjects');
      }
    };

    loadSubjects();
  }, [selectedCareer]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!currentUser || userRole !== 'student' || !selectedCareer || !selectedSubject || !selectedYear) return;

    setUploading(true);
    setUploadSuccess(false);
    setError(null);

    try {
      for (const file of acceptedFiles) {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          throw new Error('File type not allowed. Please upload PDF, Word, or image files only.');
        }

        const path = `${selectedCareer}/${selectedSubject}/${selectedYear}/${file.name}`;
        await uploadFile(file, path, {
          id: '',
          name: file.name,
          path,
          size: file.size,
          type: file.type,
          uploadedBy: currentUser.uid,
          uploaderName: `${currentUser.email}`,
          career: selectedCareer,
          subject: selectedSubject,
          academicYear: selectedYear,
          comments: [],
          uploadedAt: new Date().toISOString(),
        });
      }
      setUploadSuccess(true);
      onUploadComplete();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }, [selectedCareer, selectedSubject, selectedYear, currentUser, userRole, onUploadComplete]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    disabled: !selectedCareer || !selectedSubject
  });

  if (userRole !== 'student') return null;

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <select
          value={selectedCareer}
          onChange={(e) => {
            setSelectedCareer(e.target.value);
            setSelectedSubject('');
          }}
          className="p-2 border rounded"
        >
          <option value="">Select Career</option>
          {careers.map(career => (
            <option key={career.id} value={career.id}>
              {career.name}
            </option>
          ))}
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="p-2 border rounded"
          disabled={!selectedCareer}
        >
          <option value="">Select Subject</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="p-2 border rounded"
        >
          {ACADEMIC_YEARS.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-800 bg-blue-50' : 'border-gray-300 hover:border-blue-800'}
          ${(!selectedCareer || !selectedSubject) ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {uploadSuccess ? (
          <div className="flex flex-col items-center text-green-600">
            <Check size={24} className="mb-2" />
            <p>File uploaded successfully!</p>
          </div>
        ) : (
          <>
            <Upload 
              className={`mx-auto ${uploading ? 'animate-bounce' : ''} text-blue-800 mb-2`} 
              size={24} 
            />
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : isDragActive ? 'Drop files here...' : 'Drag files or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Accepted files: PDF, Word documents, and images (max 100MB)
            </p>
          </>
        )}
      </div>
    </div>
  );
};
