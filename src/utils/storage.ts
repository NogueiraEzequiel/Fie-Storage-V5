import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { ALLOWED_FILE_TYPES, FileMetadata, FileItem, FolderItem } from '../types';

export const uploadFile = async (file: File, path: string, metadata: FileMetadata) => {
  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('File type not allowed. Please upload PDF, Word, or image files only.');
    }

    const storageRef = ref(storage, path); // Eliminado `files/`
    const snapshot = await uploadBytes(storageRef, file, {
      customMetadata: {
        uploadedBy: metadata.uploadedBy,
        uploaderName: metadata.uploaderName,
        career: metadata.career,
        subject: metadata.subject,
        academicYear: metadata.academicYear
      }
    });

    const downloadURL = await getDownloadURL(snapshot.ref);

    const docRef = await addDoc(collection(db, 'studentWorks'), {
      ...metadata,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      downloadURL,
      path: path, // Eliminado `files/`
      createdAt: new Date().toISOString(),
      comments: []
    });

    return { downloadURL, id: docRef.id };
  } catch (error: any) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Failed to upload file');
  }
};

export const deleteFile = async (path: string, fileId: string) => {
  try {
    const storageRef = ref(storage, path); // Sin `files/`
    await deleteObject(storageRef);
    await deleteDoc(doc(db, 'studentWorks', fileId));
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error(error.message || 'Failed to delete file');
  }
};

export const listFiles = async (path: string) => {
  try {
    const folderRef = ref(storage, path); // Sin `files/`
    const result = await listAll(folderRef);

    const items: FileItem[] = await Promise.all(
      result.items
        .filter((item) => !item.fullPath.endsWith('/.keep') && item.name !== 'files') // Filtrar el archivo .keep y la carpeta files
        .map(async (item) => {
          const downloadURL = await getDownloadURL(item);
          const fileQuery = query(
            collection(db, 'studentWorks'),
            where('path', '==', item.fullPath),
            orderBy('createdAt', 'desc')
          );

          const fileSnapshot = await getDocs(fileQuery);
          const fileData = fileSnapshot.docs[0]?.data() as FileMetadata;

          return {
            id: fileSnapshot.docs[0]?.id || '',
            name: item.name,
            fullPath: item.fullPath,
            downloadURL,
            metadata: fileData
          };
        })
    );

    const folders: FolderItem[] = result.prefixes
      .filter((prefix) => prefix.name !== 'files') // Filtrar la carpeta files
      .map((prefix) => ({
        name: prefix.name,
        fullPath: prefix.fullPath
      }));

    return { items, folders };
  } catch (error: any) {
    console.error('List files error:', error);
    throw new Error(error.message || 'Failed to list files');
  }
};
export const createFolder = async (path: string, folderName: string) => {
  if (!folderName) {
    throw new Error("Folder name must be provided.");
  }

  const folderRef = ref(storage, `${path}/${folderName}/.keep`); // Sin `files/`
  const emptyBlob = new Blob([], { type: 'application/octet-stream' });
  await uploadBytes(folderRef, emptyBlob);

  await addDoc(collection(db, 'studentWorks'), {
    name: folderName,
    type: 'folder',
    path: `${path}/${folderName}`, // Sin `files/`
    createdAt: new Date().toISOString(),
    permissions: {
      read: [],
      write: []
    }
  });
};

export const renameFolder = async (currentPath: string, oldName: string, newName: string) => {
  if (!currentPath || !oldName || !newName) {
    throw new Error("Current path, old name, and new name must be provided.");
  }

  const oldFolderPath = `${currentPath}/${oldName}`;
  const newFolderPath = `${currentPath}/${newName}`;

  const oldFolderRef = ref(storage, oldFolderPath); // Sin `files/`
  const result = await listAll(oldFolderRef);

  for (const item of result.items) {
    const itemRef = ref(storage, item.fullPath);
    const itemDownloadURL = await getDownloadURL(itemRef);
    const newItemRef = ref(storage, itemRef.fullPath.replace(oldFolderPath, newFolderPath));

    const response = await fetch(itemDownloadURL);
    const blob = await response.blob();

    await uploadBytes(newItemRef, blob);
    await deleteObject(itemRef);
  }

  const fileQuery = query(
    collection(db, 'studentWorks'),
    where('path', '>=', oldFolderPath), // Sin `files/`
    where('path', '<=', `${oldFolderPath}\uf8ff`)
  );

  const fileSnapshot = await getDocs(fileQuery);
  const batch = writeBatch(db);

  fileSnapshot.docs.forEach((doc) => {
    const docRef = doc.ref;
    const newDocPath = doc.data().path.replace(oldFolderPath, newFolderPath);
    batch.update(docRef, { path: newDocPath, name: newName });
  });

  await batch.commit();
};

export const removeFolder = async (folderPath: string) => {
  if (!folderPath) {
    throw new Error("Folder path must be provided.");
  }

  const folderRef = ref(storage, folderPath); // Sin `files/`
  const result = await listAll(folderRef);

  for (const item of result.items) {
    await deleteObject(item);
  }

  const fileQuery = query(
    collection(db, 'studentWorks'),
    where('path', '>=', folderPath), // Sin `files/`
    where('path', '<=', `${folderPath}\uf8ff`)
  );

  const fileSnapshot = await getDocs(fileQuery);
  const batch = writeBatch(db);

  fileSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
