import { ref, uploadBytes, deleteObject, listAll } from 'firebase/storage';
import { storage, db } from '../lib/firebase';
import { FolderItem } from '../types';
import { collection, addDoc, deleteDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';

// Crear carpeta en Firebase Storage y añadir documento en Firestore
export const createFolder = async (path: string, folderName: string) => {
  if (!path || !folderName) {
    throw new Error("Path and folder name must be provided.");
  }

  console.log('Creating folder with path:', path, 'and folder name:', folderName);

  const folderRef = ref(storage, path);
  const emptyBlob = new Blob([], { type: 'application/json' });
  await uploadBytes(folderRef, emptyBlob);

  // Añadir documento en Firestore
  await addDoc(collection(db, 'studentWorks'), {
    name: folderName,
    type: 'folder',
    path: path,
    createdAt: new Date().toISOString(),
    permissions: {
      read: [],
      write: []
    }
  });
};

// Actualizar el nombre de la carpeta en Firestore
export const renameFolder = async (folderPath: string, newName: string) => {
  const q = query(collection(db, 'studentWorks'), where('path', '==', folderPath));
  const querySnapshot = await getDocs(q);
  const batch = writeBatch(db); // Usa writeBatch

  querySnapshot.forEach((docSnapshot) => {
    const docRef = docSnapshot.ref;
    batch.update(docRef, { name: newName });
  });

  await batch.commit();
};

// Eliminar carpeta en Firebase Storage y documento en Firestore
export const deleteFolder = async (path: string) => {
  const folderRef = ref(storage, path);
  const fileList = await listAll(folderRef);
  for (const fileRef of fileList.items) {
    await deleteObject(fileRef);
  }
  for (const prefix of fileList.prefixes) {
    await deleteFolder(prefix.fullPath);
  }
  await deleteObject(folderRef);

  // Eliminar documento en Firestore
  const q = query(collection(db, 'studentWorks'), where('path', '==', path));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(async (docSnapshot) => {
    await deleteDoc(docSnapshot.ref);
  });
};

// Listar carpetas desde Firestore
export const listFolders = async (path: string): Promise<FolderItem[]> => {
  if (!path) {
    throw new Error("Path must be provided.");
  }

  console.log('Listing folders with path:', path);
  
  const q = query(collection(db, 'studentWorks'), where('type', '==', 'folder'), where('path', '>=', path), where('path', '<', path + '\uf8ff'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    return { name: data.name, fullPath: data.path };
  });
};
