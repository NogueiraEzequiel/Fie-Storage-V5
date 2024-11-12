import { createContext, useContext, useEffect, useState } from 'react';
import { User,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole | null;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  createUserWithEmailAndPassword: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role as UserRole);
      }
    } catch (error) {
      console.error('Error al obtener el rol del usuario:', error);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    if (!email.endsWith('@fie.undef.edu.ar')) {
      throw new Error('Solo se permiten direcciones de correo @fie.undef.edu.ar');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Determina el rol basado en el patrón de correo electrónico
    const role: UserRole = email.includes('profesor') ? 'teacher' : 'student';
    
    // Crear el documento del usuario en Firestore con todos los atributos necesarios
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      role: role,
      firstName: firstName,
      lastName: lastName,
      displayName: `${firstName} ${lastName}`,
      createdAt: new Date().toISOString()
    });

    await updateProfile(userCredential.user, {
      displayName: `${firstName} ${lastName}`
    });

    setUserRole(role);
  };

  const createUserWithEmailAndPasswordFunc = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserRole(userCredential.user.uid);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null); // Asegúrate de limpiar el usuario actual
    setUserRole(null); // Asegúrate de limpiar el rol del usuario
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null); // Limpia el rol del usuario cuando no hay usuario
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    register,
    login,
    logout,
    loading,
    createUserWithEmailAndPassword: createUserWithEmailAndPasswordFunc
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
