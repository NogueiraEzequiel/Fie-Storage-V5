import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Folder, Check, Trash2, PlusCircle, Trash } from 'lucide-react';
import { FolderItem } from '../types';
import { listFiles } from '../utils/storage';

const initialCareer = { name: '', subjects: {} as { [key: string]: boolean } };

interface AdminFiltersProps {
  onToggleSubject: (subject: string, career: string) => void;
}

export const AdminFilters = ({ onToggleSubject }: AdminFiltersProps) => {
  const [careers, setCareers] = useState<{ [key: string]: { Materias: { [key: string]: boolean } } }>({});
  const [currentCareer, setCurrentCareer] = useState(initialCareer);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [allFolders, setAllFolders] = useState<FolderItem[]>([]);
  const [pendingChanges, setPendingChanges] = useState(false);
  const [showAddCareerModal, setShowAddCareerModal] = useState(false);
  const [showDeleteCareerModal, setShowDeleteCareerModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [savingChanges, setSavingChanges] = useState(false);

  useEffect(() => {
    const loadCareers = async () => {
      const docRef = doc(db, 'config', 'careers');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCareers(docSnap.data() as { [key: string]: { Materias: { [key: string]: boolean } } });
      } else {
        console.log('No such document!');
      }
    };
    loadCareers();
  }, []);

  useEffect(() => {
    const listAllFolders = async () => {
      const { folders } = await listFiles('');
      const visibleFolders = folders.filter(folder => folder.name !== 'profile-photos');
      setAllFolders(visibleFolders);
    };
    listAllFolders();
  }, []);

  const handleCareerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (pendingChanges) {
      setPendingChanges(false);
    }
    const selectedCareer = event.target.value;
    setSelectedCareer(selectedCareer);
    setCurrentCareer({ name: selectedCareer, subjects: careers[selectedCareer]?.Materias || {} });
  };

  const handleAddCareerModalChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentCareer({ ...currentCareer, name: event.target.value });
  };

  const handleAddCareer = async () => {
    setSavingChanges(true);
    if (currentCareer.name && !careers[currentCareer.name]) {
      const updatedCareers = { ...careers, [currentCareer.name]: { Materias: {} } };
      setCareers(updatedCareers);
      await setDoc(doc(db, 'config', 'careers'), updatedCareers);
      setCurrentCareer(initialCareer);
      setTimeout(() => {
        setSavingChanges(false);
        setShowAddCareerModal(false);
        setShowSuccessMessage('¡Carrera Creada Exitosamente!');
      }, 2000);
      setTimeout(() => setShowSuccessMessage(''), 4000);
    }
  };

  const handleDeleteCareer = async () => {
    setSavingChanges(true);
    if (selectedCareer) {
      const updatedCareers = { ...careers };
      delete updatedCareers[selectedCareer];
      setCareers(updatedCareers);
      await setDoc(doc(db, 'config', 'careers'), updatedCareers);
      setCurrentCareer(initialCareer);
      setSelectedCareer('');
      setTimeout(() => {
        setSavingChanges(false);
        setShowDeleteCareerModal(false);
        setShowSuccessMessage(`La Carrera "${selectedCareer}" Fue Eliminada Exitosamente`);
      }, 2000);
      setTimeout(() => setShowSuccessMessage(''), 4000);
    }
  };

  const handleToggleSubject = (subject: string) => {
    const updatedSubjects = { ...currentCareer.subjects, [subject]: !currentCareer.subjects[subject] };
    setCurrentCareer({ ...currentCareer, subjects: updatedSubjects });
    setPendingChanges(true);
  };

  const handleSaveChanges = async () => {
    setSavingChanges(true);
    const updatedCareers = {
      ...careers,
      [currentCareer.name]: { Materias: currentCareer.subjects }
    };
    setCareers(updatedCareers);
    await setDoc(doc(db, 'config', 'careers'), updatedCareers);
    onToggleSubject(currentCareer.name, currentCareer.name);
    setSavingChanges(false);
    setPendingChanges(false);
    setShowSuccessMessage('¡Cambios Guardados Exitosamente!');
    setTimeout(() => {
      setShowSuccessMessage('');
    }, 2000);
  };

  return (
    <div className="max-w-full mx-auto p-8 bg-white rounded-lg shadow-md h-full overflow-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">Administrar Carreras</h2>
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Carrera</label>
        <select
          value={selectedCareer}
          onChange={handleCareerChange}
          className="w-full p-2 border rounded"
        >
          <option value="">Seleccionar Carrera</option>
          {Object.keys(careers).map(career => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>
      </div>
  
      {!selectedCareer && (
        <button
          onClick={() => setShowAddCareerModal(true)}
          className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-900 flex items-center gap-2 mb-4"
        >
          <PlusCircle className="w-6 h-6" />
          Agregar Carrera
        </button>
      )}
  
      {selectedCareer && (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Materias</label>
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
            <div className="flex justify-end">
              <button
                onClick={() => setShowDeleteCareerModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-6 h-6" />
                Eliminar Carrera
              </button>
            </div>
          </div>
        </>
      )}
      {pendingChanges && (
        <div className="mt-4 flex justify-end relative">
          <button
            onClick={handleSaveChanges}
            className={`flex items-center justify-center relative h-10 w-40 ${savingChanges ? 'bg-transparent' : 'bg-blue-800 text-white hover:bg-blue-900'} rounded`}
          >
            {savingChanges ? (
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-800"></div>
              </div>
            ) : (
              <>
                <Check size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      )}
      {showAddCareerModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowAddCareerModal(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {savingChanges ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
              </div>
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={currentCareer.name}
                  onChange={handleAddCareerModalChange}
                  className="w-full p-2 border rounded"
                  placeholder="Nombre de la Carrera"
                />
                <button
                  onClick={handleAddCareer}
                  className="ml-2 p-2 rounded bg-blue-800 text-white hover:bg-blue-900 flex items-center"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
  
      {showDeleteCareerModal && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowDeleteCareerModal(false)}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-full sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl" onClick={(e) => e.stopPropagation()}>
            {savingChanges ? (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">¿Está seguro que quiere eliminar la carrera "{selectedCareer}"?</h3>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowDeleteCareerModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteCareer}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash className="w-6 h-6" />
                    Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
  
      {showSuccessMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white p-6 rounded-lg shadow-lg ${showSuccessMessage.includes('Eliminada') ? 'text-red-600' : 'text-green-600'}`}>
            <h3 className="text-lg font-medium mb-4">{showSuccessMessage}</h3>
          </div>
        </div>
      )}
    </div>
  );
}