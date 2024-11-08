export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  photoURL?: string;
  createdAt: string;
}

export interface FileGrade {
  score: number;
  teacherId: string;
  teacherName: string;
  gradedAt: string;
  lastModified?: string;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorEmail: string;
  authorName: string;
  createdAt: string;
  lastModified?: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploaderName: string;
  uploadedAt: string;
  career: string;
  subject: string;
  academicYear: string;
  comments: Comment[];
  grade?: FileGrade;
}

export interface Career {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  careerId: string;
}

export interface FileItem {
  id: string;
  name: string;
  fullPath: string;
  downloadURL: string;
  metadata: FileMetadata;
}

export interface FolderItem {
  name: string;
  fullPath: string;
}

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif'
];

export const ACADEMIC_YEARS = [
  '2024',
  '2023',
  '2022',
  '2021',
  '2020'
];
