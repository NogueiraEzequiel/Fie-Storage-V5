import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface FiltersProps {
  onCareerChange: (career: string) => void;
  onSubjectChange: (subject: string) => void;
  onYearChange: (year: string) => void;
  selectedCareer: string;
  selectedSubject: string;
  selectedYear: string;
  subjects: string[];
  years: string[];
}

const Filters = ({
  onCareerChange,
  onSubjectChange,
  onYearChange,
  selectedCareer,
  selectedSubject,
  selectedYear,
  subjects,
  years
}: FiltersProps) => {
  const [careers, setCareers] = useState<{ [key: string]: any }>({});

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

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Carrera
        </label>
        <select
          value={selectedCareer}
          onChange={(e) => onCareerChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Selecciona una carrera</option>
          {Object.keys(careers).map(career => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Materia
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={!selectedCareer}
        >
          <option value="">Selecciona una materia</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Año Lectivo
        </label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={!selectedSubject}
        >
          <option value="">Selecciona un año lectivo</option>
          {(years instanceof Array ? years : []).map(year => ( // Asegurarse de que years siempre sea un array
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Filters;
