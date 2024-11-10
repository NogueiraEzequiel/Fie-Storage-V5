import { FileItem, FolderItem } from '../types';

interface ContentPanelProps {
  currentPath: string;
  files: FileItem[];
  folders: FolderItem[];
  onFileClick: (file: FileItem) => void;
  onFolderClick: (path: string) => void;
  onDeleteFile: (file: FileItem) => void;
  onCommentClick: (file: FileItem) => void;
}

export const ContentPanel = ({ currentPath, files, folders, onFileClick, onFolderClick, onDeleteFile, onCommentClick }: ContentPanelProps) => {
  return (
    <div className="flex-1 p-4">
      <h2 className="text-xl mb-4">Ruta Actual: {currentPath}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map((folder) => (
          <div key={folder.fullPath} className="p-4 border rounded shadow hover:shadow-md cursor-pointer">
            <span onClick={() => onFolderClick(folder.fullPath)}>{folder.name}</span>
          </div>
        ))}
        {files.map((file) => (
          <div key={file.fullPath} className="p-4 border rounded shadow hover:shadow-md">
            <span onClick={() => onFileClick(file)}>{file.name}</span>
            <button onClick={() => onDeleteFile(file)} className="ml-2 text-red-500">Eliminar</button>
            <button onClick={() => onCommentClick(file)} className="ml-2 text-blue-500">Comentarios</button>
          </div>
        ))}
      </div>
    </div>
  );
};
