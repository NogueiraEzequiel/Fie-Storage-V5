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
}

export const Filters = ({
  onCareerChange,
  onSubjectChange,
  onYearChange,
  selectedCareer,
  selectedSubject,
  selectedYear
}: FiltersProps) => {
  const [careers, setCareers] = useState<any>({});
  const [subjects, setSubjects] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

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
    if (selectedCareer) {
      setSubjects(Object.keys(careers[selectedCareer]?.Materias || {}));
    }
  }, [selectedCareer, careers]);

  useEffect(() => {
    if (selectedCareer && selectedSubject) {
      setYears(careers[selectedCareer]?.Materias[selectedSubject] || []);
    }
  }, [selectedCareer, selectedSubject, careers]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Career
        </label>
        <select
          value={selectedCareer}
          onChange={(e) => onCareerChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Career</option>
          {Object.keys(careers).map(career => (
            <option key={career} value={career}>{career}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={!selectedCareer}
        >
          <option value="">Select Subject</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Academic Year
        </label>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="w-full p-2 border rounded"
          required
          disabled={!selectedSubject}
        >
          <option value="">Select Academic Year</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
