import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Folder } from 'lucide-react';
import { FolderItem } from '../types';

const initialCareer = { name: '', subjects: {} as { [key: string]: boolean } };

export const AdminFilters = () => {
  const [careers, setCareers] = useState<any>({});
  const [currentCareer, setCurrentCareer] = useState(initialCareer);
  const [selectedCareer, setSelectedCareer] = useState<string>('');
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);

  useEffect(() => {
    const loadCareers = async () => {
      const docRef = doc(db, 'config', 'careers');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCareers(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };
    loadCareers();
  }, []);

  useEffect(() => {
    // Aquí cargarías todas las materias disponibles que pueden ser carpetas.
    const listAllFolders = async (): Promise<FolderItem[]> => {
      // Implementación ficticia para listar todas las carpetas.
      return [
        { name: 'Materia1', fullPath: 'path/to/materia1' },
        { name: 'Materia2', fullPath: 'path/to/materia2' },
      ];
    };
    const loadFolders = async () => {
      const folders = await listAllFolders();
      setAllFolders(folders);
    };
    loadFolders();
  }, []);

  const handleCareerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCareer = event.target.value;
    setSelectedCareer(selectedCareer);
    setCurrentCareer({ name: selectedCareer, subjects: careers[selectedCareer]?.Materias || {} });
  };

  const handleCareerNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCareer({ ...currentCareer, name: event.target.value });
  };
  const handleAddCareer = async () => {
    if (currentCareer.name && !careers[currentCareer.name]) {
      const updatedCareers = { ...careers, [currentCareer.name]: { Materias: {} as { [key: string]: boolean } } };
      setCareers(updatedCareers);
      await setDoc(doc(db, 'config', 'careers'), updatedCareers);
      setCurrentCareer(initialCareer);
    }
  };

  const handleUpdateCareer = async () => {
    if (selectedCareer && currentCareer.name) {
      const updatedCareers = { ...careers, [currentCareer.name]: { Materias: currentCareer.subjects } };
      if (selectedCareer !== currentCareer.name) {
        delete updatedCareers[selectedCareer];
      }
      setCareers(updatedCareers);
      await setDoc(doc(db, 'config', 'careers'), updatedCareers);
      setCurrentCareer(initialCareer);
      setSelectedCareer('');
    }
  };

  const handleDeleteCareer = async () => {
    if (selectedCareer) {
      const updatedCareers = { ...careers };
      delete updatedCareers[selectedCareer];
      setCareers(updatedCareers);
      await setDoc(doc(db, 'config', 'careers'), updatedCareers);
      setCurrentCareer(initialCareer);
      setSelectedCareer('');
    }
  };

  const handleToggleSubject = async (subject: string) => {
    const updatedSubjects: { [key: string]: boolean } = { ...currentCareer.subjects, [subject]: !currentCareer.subjects[subject] };
    setCurrentCareer({ ...currentCareer, subjects: updatedSubjects });
    const updatedCareers = {
      ...careers,
      [currentCareer.name]: { Materias: updatedSubjects }
    };
    setCareers(updatedCareers);
    await setDoc(doc(db, 'config', 'careers'), updatedCareers);
  };
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Administer Careers</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Career</label>
        <select
          value={selectedCareer}
          onChange={handleCareerChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Career</option>
          {Object.keys(careers).map(career => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Career Name</label>
        <input
          type="text"
          value={currentCareer.name}
          onChange={handleCareerNameChange}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFolders.map((folder) => (
            <button
              key={folder.fullPath}
              onClick={() => handleToggleSubject(folder.name)}
              className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow w-full"
            >
              <Folder className={`mr-3 ${currentCareer.subjects[folder.name] ? 'text-green-600' : 'text-red-600'}`} size={24} />
              <span className="text-gray-700">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleAddCareer}
          className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900"
        >
          Add Career
        </button>
        <button
          onClick={handleUpdateCareer}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Career
        </button>
        <button
          onClick={handleDeleteCareer}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Career
        </button>
      </div>
    </div>
  );
};
