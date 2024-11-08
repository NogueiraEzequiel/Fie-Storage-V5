import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, MessageSquare, Star } from 'lucide-react';
import { UserRole } from '../types';

interface FileActivity {
  id: string;
  type: 'upload' | 'comment' | 'grade';
  fileName: string;
  timestamp: string;
  details?: string;
}

interface FileActivityProps {
  userId: string;
  userRole: UserRole;
}

export const FileActivity = ({ userId, userRole }: FileActivityProps) => {
  const [activities, setActivities] = useState<FileActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        let activityList: FileActivity[] = [];

        if (userRole === 'student') {
          // Get uploaded files
          const filesQuery = query(
            collection(db, 'studentWorks'),
            where('uploadedBy', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const filesDocs = await getDocs(filesQuery);
          
          activityList = filesDocs.docs.map(doc => ({
            id: doc.id,
            type: 'upload' as const,
            fileName: doc.data().fileName,
            timestamp: doc.data().createdAt
          }));
        } else if (userRole === 'teacher') {
          // Get comments and grades
          const commentsQuery = query(
            collection(db, 'studentWorks'),
            where('comments', 'array-contains', { authorId: userId }),
            orderBy('createdAt', 'desc')
          );
          const commentsDocs = await getDocs(commentsQuery);
          
          const gradesQuery = query(
            collection(db, 'studentWorks'),
            where('grade.teacherId', '==', userId),
            orderBy('gradedAt', 'desc')
          );
          const gradesDocs = await getDocs(gradesQuery);

          activityList = [
            ...commentsDocs.docs.map(doc => ({
              id: doc.id,
              type: 'comment' as const,
              fileName: doc.data().fileName,
              timestamp: doc.data().comments.find((c: any) => c.authorId === userId).createdAt,
              details: doc.data().comments.find((c: any) => c.authorId === userId).text
            })),
            ...gradesDocs.docs.map(doc => ({
              id: doc.id,
              type: 'grade' as const,
              fileName: doc.data().fileName,
              timestamp: doc.data().grade.gradedAt,
              details: `Grade: ${doc.data().grade.score}/10`
            }))
          ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }

        setActivities(activityList);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId, userRole]);
  const getActivityIcon = (type: 'upload' | 'comment' | 'grade') => {
    switch (type) {
      case 'upload':
        return <FileText className="text-blue-800" size={20} />;
      case 'comment':
        return <MessageSquare className="text-green-600" size={20} />;
      case 'grade':
        return <Star className="text-yellow-500" size={20} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        {userRole === 'student' ? 'Upload History' : 'Activity History'}
      </h3>
      
      {activities.length > 0 ? (
        activities.map((activity) => (
          <div
            key={`${activity.id}-${activity.type}`}
            className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
          >
            {getActivityIcon(activity.type)}
            <div className="flex-1">
              <p className="font-medium text-gray-900">{activity.fileName}</p>
              {activity.details && (
                <p className="text-sm text-gray-600">{activity.details}</p>
              )}
              <p className="text-xs text-gray-500">
                {new Date(activity.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-4">No activity yet</p>
      )}
    </div>
  );
};
