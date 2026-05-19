/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const STORAGE_KEY = 'resume_builder_data';

const DEFAULT_SECTION_ORDER = [
  'summary',
  'workExperience',
  'education',
  'skills',
  'projects',
  'certifications',
  'languages',
];

const normalizeSectionOrder = (order) => {
  if (!Array.isArray(order)) return [...DEFAULT_SECTION_ORDER];
  const filtered = order.filter((section) => DEFAULT_SECTION_ORDER.includes(section));
  const missing = DEFAULT_SECTION_ORDER.filter((section) => !filtered.includes(section));
  return [...filtered, ...missing];
};

const initialState = {
  personalInfo: {
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    summary: '',
  },
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
};

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        ...parsed,
        personalInfo: { ...initialState.personalInfo, ...(parsed.personalInfo || {}) },
        sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
      };
    }
  } catch {
    // ignore parse errors
  }
  return initialState;
}

const ResumeContext = createContext(null);

export function ResumeProvider({ children }) {
  const [resume, setResume] = useState(loadFromStorage);

  // Persist to localStorage with debounce to avoid excessive writes while typing
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      } catch {
        // ignore storage errors (e.g. private browsing quota)
      }
    }, 400);
    return () => clearTimeout(saveTimerRef.current);
  }, [resume]);

  const updatePersonalInfo = (field, value) => {
    setResume(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addEntry = (section, entry) => {
    setResume(prev => ({
      ...prev,
      [section]: [...prev[section], entry],
    }));
  };

  const updateEntry = (section, index, field, value) => {
    setResume(prev => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const removeEntry = (section, index) => {
    setResume(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill) => {
    if (skill && !resume.skills.includes(skill)) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skill) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const reorderSkills = (newOrder) => {
    setResume(prev => ({ ...prev, skills: newOrder }));
  };

  const reorderSections = (newOrder) => {
    setResume(prev => ({ ...prev, sectionOrder: normalizeSectionOrder(newOrder) }));
  };

  return (
    <ResumeContext.Provider value={{
      resume,
      updatePersonalInfo,
      addEntry,
      updateEntry,
      removeEntry,
      addSkill,
      removeSkill,
      reorderSkills,
      reorderSections,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
