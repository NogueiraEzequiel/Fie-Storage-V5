import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, MessageSquare, Download } from 'lucide-react';

interface Activity {
  type: 'upload' | 'comment' | 'download';
  fileName: string;
  timestamp: string;
  path: string;
}

export const ActivityHistory = ({ userId }: { userId: string }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      try {
        // Get file uploads
        const uploadsQuery = query(
          collection(db, 'files'),
          where('uploadedBy', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const uploadDocs = await getDocs(uploadsQuery);
        const uploads = uploadDocs.docs.map(doc => ({
          type: 'upload' as const,
          fileName: doc.data().name,
          timestamp: doc.data().createdAt,
          path: doc.data().path
        }));

        // Get comments
        const commentsQuery = query(
          collection(db, 'comments'),
          where('authorId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const commentDocs = await getDocs(commentsQuery);
        const comments = commentDocs.docs.map(doc => ({
          type: 'comment' as const,
          fileName: doc.data().fileName,
          timestamp: doc.data().createdAt,
          path: doc.data().filePath
        }));

        // Combine and sort activities
        const allActivities = [...uploads, ...comments].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setActivities(allActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [userId]);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'upload':
        return <FileText className="text-green-500" size={20} />;
      case 'comment':
        return <MessageSquare className="text-blue-500" size={20} />;
      case 'download':
        return <Download className="text-purple-500" size={20} />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case 'upload':
        return `Uploaded ${activity.fileName}`;
      case 'comment':
        return `Commented on ${activity.fileName}`;
      case 'download':
        return `Downloaded ${activity.fileName}`;
    }
  };

  if (loading) {
    return (
      <div className="p-6 border-t">
        <h2 className="text-xl font-semibold mb-4">Activity History</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-t">
      <h2 className="text-xl font-semibold mb-4">Activity History</h2>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-gray-700">{getActivityText(activity)}</p>
                <p className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No activity yet</p>
      )}
    </div>
  );
};