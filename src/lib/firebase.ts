import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyC7pptF_TT5ORgzQaIwNpRFsO3diQt92n4',
  authDomain: 'storage-fie.firebaseapp.com',
  projectId: 'storage-fie',
  storageBucket: 'storage-fie.appspot.com',
  messagingSenderId: '447260841577',
  appId: '1:447260841577:web:1a3422e62f935440fa74f8',
  measurementId: 'G-6RW1HM6DWN',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
