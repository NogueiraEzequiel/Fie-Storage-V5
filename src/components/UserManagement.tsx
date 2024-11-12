import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { UserX } from 'lucide-react';
import { User, UserRole } from '../types';

export const UserManagement = () => {
  const { userRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            uid: doc.id,
            email: data.email,
            role: data.role,
            firstName: data.firstName,
            lastName: data.lastName,
            photoURL: data.photoURL,
            createdAt: data.createdAt
          } as User;
        });
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(user =>
        user.uid === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      // Eliminar el documento del usuario de Firestore
      await deleteDoc(doc(db, 'users', userId));
      // Eliminar cualquier otra información relacionada con el usuario
      // Por ejemplo, eliminar documentos, configuraciones, etc. (Agregar lógica aquí si es necesario)

      setUsers(users.filter(user => user.uid !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (userRole !== 'admin') return null;

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">Administración de Usuarios</h2>
      
      <div className="space-y-4">
        {users.map(user => (
          <div
            key={user.uid}
            className="flex items-center justify-between p-4 bg-gray-100 rounded-md shadow-sm"
          >
            <div>
              <p className="font-medium text-lg">{user.firstName} {user.lastName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-xs text-gray-400">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                className="p-2 border rounded bg-white shadow"
              >
                <option value="student">Estudiante</option>
                <option value="teacher">Docente</option>
                <option value="admin">Administrador</option>
              </select>

              <button
                onClick={() => handleDeleteUser(user.uid)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <UserX size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
