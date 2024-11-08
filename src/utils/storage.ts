import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { storage, db } from '../lib/firebase';
import { ALLOWED_FILE_TYPES, FileMetadata } from '../types';

export const uploadFile = async (file: File, path: string, metadata: FileMetadata) => {
  try {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('File type not allowed. Please upload PDF, Word, or image files only.');
    }

    const storageRef = ref(storage, `files/${path}`);

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
      path: `files/${path}`,
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
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    await deleteDoc(doc(db, 'studentWorks', fileId));
  } catch (error: any) {
    console.error('Delete error:', error);
    throw new Error(error.message || 'Failed to delete file');
  }
};

export const listFiles = async (path: string) => {
  try {
    const folderRef = ref(storage, `files/${path}`);
    const result = await listAll(folderRef);
    
    const items = await Promise.all(
      result.items.map(async (item) => {
        const downloadURL = await getDownloadURL(item);
        const fileQuery = query(
          collection(db, 'studentWorks'),
          where('path', '==', item.fullPath),
          orderBy('createdAt', 'desc'),
          orderBy('__name__', 'desc')
        );
        
        const fileSnapshot = await getDocs(fileQuery);
        const fileData = fileSnapshot.docs[0]?.data();
        
        return {
          id: fileSnapshot.docs[0]?.id || '',
          name: item.name,
          fullPath: item.fullPath,
          downloadURL,
          metadata: fileData || {}
        };
      })
    );

    const folders = result.prefixes.map((prefix) => ({
      name: prefix.name,
      fullPath: prefix.fullPath
    }));

    return { items, folders };
  } catch (error: any) {
    console.error('List files error:', error, `Path: ${path}`); // Se agrega más contexto al error
    throw new Error(error.message || 'Failed to list files');
  }
};
