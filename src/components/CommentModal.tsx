import { useState, useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { X, Send, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Comment, FileGrade } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc, arrayUnion, onSnapshot, arrayRemove, getDoc } from 'firebase/firestore'; // Agregado getDoc

interface CommentModalProps {
  fileId: string;
  isOpen: boolean;
  onClose: () => void;
  currentGrade?: FileGrade;
  canEdit: boolean;
}

export const CommentModal = ({ fileId, isOpen, onClose, currentGrade, canEdit }: CommentModalProps) => {
  const { currentUser, userRole } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [grade, setGrade] = useState<number>(currentGrade?.score || 0);
  const [error, setError] = useState<string | null>(null);

  const modalSpring = useSpring({
    transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
    opacity: isOpen ? 1 : 0,
  });

  const overlaySpring = useSpring({
    opacity: isOpen ? 0.5 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
  });

  useEffect(() => {
    if (!fileId || !isOpen) return;

    const fileRef = doc(db, 'studentWorks', fileId);
    const unsubscribe = onSnapshot(fileRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setComments(data.comments || []);
        setGrade(data.grade?.score || 0);
      }
    });

    return () => unsubscribe();
  }, [fileId, isOpen]);

  const handleAddComment = async () => {
    if (!currentUser || !newComment.trim() || userRole !== 'teacher' || !fileId) {
      setError('Invalid request. Please check your input.');
      return;
    }

    try {
      setError(null);
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        authorId: currentUser.uid,
        authorEmail: currentUser.email || '',
        authorName: currentUser.displayName || '',
        createdAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'studentWorks', fileId), {
        comments: arrayUnion(comment)
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    }
  };
  const handleGradeChange = async (newGrade: number) => {
    if (!currentUser || !canEdit || userRole !== 'teacher' || !fileId) {
      setError('Invalid request. Please check your input.');
      return;
    }

    try {
      setError(null);
      const gradeData: FileGrade = {
        score: newGrade,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName || '',
        gradedAt: new Date().toISOString(),
        lastModified: currentGrade ? new Date().toISOString() : undefined
      };

      await updateDoc(doc(db, 'studentWorks', fileId), { grade: gradeData });
    } catch (error) {
      console.error('Error updating grade:', error);
      setError('Failed to update grade');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || !fileId) {
      setError('Invalid request. Please check your input.');
      return;
    }

    try {
      setError(null);
      const fileRef = doc(db, 'studentWorks', fileId);
      const fileDoc = (await getDoc(fileRef)).data();
      const commentToDelete = fileDoc?.comments.find((comment: Comment) => comment.id === commentId);

      if (commentToDelete && commentToDelete.authorId === currentUser.uid) {
        await updateDoc(fileRef, {
          comments: arrayRemove(commentToDelete)
        });
      } else {
        setError("You can't delete this comment.");
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  return (
    <>
      <animated.div
        style={{
          ...overlaySpring,
          visibility: overlaySpring.opacity.to((opacity) => (opacity === 0 ? 'hidden' : 'visible')),
        }}
        className="fixed inset-0 bg-black"
        onClick={onClose}
      />
      <animated.div
        style={modalSpring}
        className="fixed inset-x-0 bottom-0 bg-white rounded-t-xl shadow-lg max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Comments & Grade</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {canEdit && userRole === 'teacher' && (
            <div className="mt-4 flex items-center">
              <Star className="text-yellow-500 mr-2" size={20} />
              <select
                value={grade}
                onChange={(e) => handleGradeChange(Number(e.target.value))}
                className="p-2 border rounded"
              >
                <option value="0">Select grade</option>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}/10</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-100 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
        </div>
        <div className="p-4 space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-blue-800">{comment.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
                {comment.authorId === currentUser?.uid && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              <p className="text-gray-700">{comment.text}</p>
            </div>
          ))}
        </div>
        {userRole === 'teacher' && (
          <div className="sticky bottom-0 bg-white pt-4">
            <div className="flex gap-2">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 p-2 border rounded resize-none focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                rows={2}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-blue-800 text-white rounded hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </animated.div>
    </>
  );
};
