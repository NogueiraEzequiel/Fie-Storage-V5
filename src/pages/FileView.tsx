import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { FileMetadata, Comment } from '../types';
import { Download, MessageSquare } from 'lucide-react';

export const FileView = () => {
  const { fileId } = useParams();
  const { currentUser } = useAuth();
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string>('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFile = async () => {
      if (!fileId) return;

      try {
        const fileDoc = await getDoc(doc(db, 'files', fileId));
        if (fileDoc.exists()) {
          const fileData = fileDoc.data() as FileMetadata;
          setFile(fileData);

          // Get download URL
          const storageRef = ref(storage, fileData.path);
          const url = await getDownloadURL(storageRef);
          setDownloadUrl(url);
        }
      } catch (error) {
        console.error('Error loading file:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId]);
  const handleDownload = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const handleAddComment = async () => {
    if (!currentUser || !fileId || !comment.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      text: comment,
      createdAt: new Date().toISOString(),
      authorId: currentUser.uid,
      authorEmail: currentUser.email || '',
      authorName: currentUser.displayName || 'Anonymous' // Asegúrate de que currentUser.displayName esté disponible
    };
    
    try {
      await updateDoc(doc(db, 'files', fileId), {
        comments: arrayUnion(newComment)
      });

      setFile(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null);
      
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!file) {
    return <div>File not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{file.name}</h1>
            <div className="text-sm text-gray-500">
              <p>Uploaded by {file.uploadedBy}</p>
              <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
              <p>Type: {file.type}</p>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
          >
            <Download size={20} className="mr-2" />
            Download
          </button>
        </div>
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <MessageSquare size={20} className="text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold">Comments</h2>
          </div>

          <div className="space-y-4 mb-6">
            {file.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium">{comment.authorEmail}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors"
            >
              Comment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
