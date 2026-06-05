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
  skillGroups: [
    { category: 'Frontend', skills: [] },
    { category: 'Backend', skills: [] },
    { category: 'Tools and Deployment', skills: [] },
    { category: 'Other', skills: [] },
  ],
  projects: [],
  certifications: [],
  languages: [],
  sectionOrder: [...DEFAULT_SECTION_ORDER],
  pageBreaks: [],
};

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      
      // Migration: convert old flat skills array to skillGroups
      let skillGroups = parsed.skillGroups;
      if (!skillGroups && parsed.skills && Array.isArray(parsed.skills)) {
        // If old flat skills format exists, migrate to skillGroups
        skillGroups = [
          { category: 'Frontend', skills: [] },
          { category: 'Backend', skills: [] },
          { category: 'Tools and Deployment', skills: [] },
          { category: 'Other', skills: parsed.skills },
        ];
      }
      
      return {
        ...initialState,
        ...parsed,
        skillGroups: skillGroups || initialState.skillGroups,
        personalInfo: { ...initialState.personalInfo, ...(parsed.personalInfo || {}) },
        sectionOrder: normalizeSectionOrder(parsed.sectionOrder),
        pageBreaks: parsed.pageBreaks || [],
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

  const addSkillGroup = (category) => {
    if (category && category.trim()) {
      setResume(prev => ({
        ...prev,
        skillGroups: [...prev.skillGroups, { category: category.trim(), skills: [] }],
      }));
    }
  };

  const removeSkillGroup = (groupIndex) => {
    setResume(prev => ({
      ...prev,
      skillGroups: prev.skillGroups.filter((_, i) => i !== groupIndex),
    }));
  };

  const updateSkillGroupCategory = (groupIndex, newCategory) => {
    setResume(prev => {
      const updated = [...prev.skillGroups];
      if (updated[groupIndex]) {
        updated[groupIndex] = { ...updated[groupIndex], category: newCategory };
      }
      return { ...prev, skillGroups: updated };
    });
  };

  const addSkillToGroup = (groupIndex, skill) => {
    if (skill && skill.trim()) {
      setResume(prev => {
        const updated = [...prev.skillGroups];
        if (updated[groupIndex]) {
          const skills = updated[groupIndex].skills;
          if (!skills.includes(skill.trim())) {
            updated[groupIndex] = {
              ...updated[groupIndex],
              skills: [...skills, skill.trim()],
            };
          }
        }
        return { ...prev, skillGroups: updated };
      });
    }
  };

  const removeSkillFromGroup = (groupIndex, skillIndex) => {
    setResume(prev => {
      const updated = [...prev.skillGroups];
      if (updated[groupIndex]) {
        updated[groupIndex] = {
          ...updated[groupIndex],
          skills: updated[groupIndex].skills.filter((_, i) => i !== skillIndex),
        };
      }
      return { ...prev, skillGroups: updated };
    });
  };

  const reorderSkillsInGroup = (groupIndex, newSkillsOrder) => {
    setResume(prev => {
      const updated = [...prev.skillGroups];
      if (updated[groupIndex]) {
        updated[groupIndex] = { ...updated[groupIndex], skills: newSkillsOrder };
      }
      return { ...prev, skillGroups: updated };
    });
  };

  const reorderSkillGroups = (newOrder) => {
    setResume(prev => ({ ...prev, skillGroups: newOrder }));
  };

  const addPageBreak = (sectionIndex) => {
    setResume(prev => {
      const newBreaks = [...prev.pageBreaks];
      if (!newBreaks.includes(sectionIndex)) {
        newBreaks.push(sectionIndex);
        newBreaks.sort((a, b) => a - b);
      }
      return { ...prev, pageBreaks: newBreaks };
    });
  };

  const removePageBreak = (sectionIndex) => {
    setResume(prev => ({
      ...prev,
      pageBreaks: prev.pageBreaks.filter(idx => idx !== sectionIndex),
    }));
  };

  const togglePageBreak = (sectionIndex) => {
    setResume(prev => {
      const hasBreak = prev.pageBreaks.includes(sectionIndex);
      if (hasBreak) {
        return { ...prev, pageBreaks: prev.pageBreaks.filter(idx => idx !== sectionIndex) };
      } else {
        const newBreaks = [...prev.pageBreaks, sectionIndex].sort((a, b) => a - b);
        return { ...prev, pageBreaks: newBreaks };
      }
    });
  };

  return (
    <ResumeContext.Provider value={{
      resume,
      updatePersonalInfo,
      addEntry,
      updateEntry,
      removeEntry,
      addSkillGroup,
      removeSkillGroup,
      updateSkillGroupCategory,
      addSkillToGroup,
      removeSkillFromGroup,
      reorderSkillsInGroup,
      reorderSkillGroups,
      reorderSections: (newOrder) => {
        setResume(prev => ({ ...prev, sectionOrder: normalizeSectionOrder(newOrder) }));
      },
      addPageBreak,
      removePageBreak,
      togglePageBreak,
    }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
