/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_SUBSECTION_TYPE, createEmptyCustomEntry } from '../utils/customSections';
import { DEFAULT_GLOBAL_DESIGN, normalizeDesignSettings } from '../utils/designSettings';
import { moveItemInArray } from '../utils/reorder';
import {
  BUILTIN_SECTION_KEYS,
  fromCustomSectionKey,
  isCustomSectionKey,
  toCustomSectionKey,
} from '../utils/sections';

const STORAGE_KEY = 'resume_builder_data';

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const normalizeCustomSection = (section) => ({
  id: section?.id || createId('custom'),
  name: section?.name || 'Custom Section',
  typeId: section?.typeId || DEFAULT_SUBSECTION_TYPE,
  entries: Array.isArray(section?.entries)
    ? section.entries.map((entry) => ({
      id: entry?.id || createId('entry'),
      collapsed: Boolean(entry?.collapsed),
      values: { ...(entry?.values || {}) },
    }))
    : [],
});

const normalizeSectionOrder = (order, customSections = []) => {
  const customSectionKeys = customSections.map((section) => toCustomSectionKey(section.id));
  const allowed = [...BUILTIN_SECTION_KEYS, ...customSectionKeys];
  if (!Array.isArray(order)) return allowed;
  const filtered = order.filter((sectionKey) => allowed.includes(sectionKey));
  const missing = allowed.filter((sectionKey) => !filtered.includes(sectionKey));
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
  customSections: [],
  sectionOrder: [...BUILTIN_SECTION_KEYS],
  designSettings: {
    global: { ...DEFAULT_GLOBAL_DESIGN },
    sections: {},
  },
};

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const customSections = Array.isArray(parsed.customSections)
        ? parsed.customSections.map(normalizeCustomSection)
        : [];
      return {
        ...initialState,
        ...parsed,
        personalInfo: { ...initialState.personalInfo, ...(parsed.personalInfo || {}) },
        customSections,
        sectionOrder: normalizeSectionOrder(parsed.sectionOrder, customSections),
        designSettings: normalizeDesignSettings(parsed.designSettings),
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

  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
      } catch {
        // ignore storage errors
      }
    }, 400);
    return () => clearTimeout(saveTimerRef.current);
  }, [resume]);

  const updatePersonalInfo = (field, value) => {
    setResume((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const addEntry = (section, entry) => {
    setResume((prev) => ({
      ...prev,
      [section]: [...prev[section], entry],
    }));
  };

  const updateEntry = (section, index, field, value) => {
    setResume((prev) => {
      const updated = [...prev[section]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  const removeEntry = (section, index) => {
    setResume((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const addSkill = (skill) => {
    if (skill && !resume.skills.includes(skill)) {
      setResume((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const removeSkill = (skill) => {
    setResume((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };

  const reorderSkills = (newOrder) => {
    setResume((prev) => ({ ...prev, skills: newOrder }));
  };

  const reorderSections = (newOrder) => {
    setResume((prev) => ({
      ...prev,
      sectionOrder: normalizeSectionOrder(newOrder, prev.customSections),
    }));
  };

  const reorderEntries = (section, fromIndex, toIndex) => {
    setResume((prev) => {
      const entries = prev[section];
      if (!Array.isArray(entries)) return prev;
      const reordered = moveItemInArray(entries, fromIndex, toIndex);
      if (reordered === entries) return prev;
      return { ...prev, [section]: reordered };
    });
  };

  const moveEntry = (section, index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    reorderEntries(section, index, targetIndex);
  };

  const updateGlobalDesignSetting = (field, value) => {
    setResume((prev) => ({
      ...prev,
      designSettings: {
        ...normalizeDesignSettings(prev.designSettings),
        global: {
          ...normalizeDesignSettings(prev.designSettings).global,
          [field]: value,
        },
      },
    }));
  };

  const updateSectionDesignSetting = (sectionKey, field, value) => {
    setResume((prev) => {
      const normalized = normalizeDesignSettings(prev.designSettings);
      return {
        ...prev,
        designSettings: {
          ...normalized,
          sections: {
            ...normalized.sections,
            [sectionKey]: {
              ...(normalized.sections[sectionKey] || {}),
              [field]: value,
            },
          },
        },
      };
    });
  };

  const addCustomSection = (name) => {
    const sectionName = name?.trim();
    if (!sectionName) return;
    setResume((prev) => {
      const newSection = {
        id: createId('custom'),
        name: sectionName,
        typeId: DEFAULT_SUBSECTION_TYPE,
        entries: [],
      };
      const customSections = [...prev.customSections, newSection];
      return {
        ...prev,
        customSections,
        sectionOrder: normalizeSectionOrder(
          [...prev.sectionOrder, toCustomSectionKey(newSection.id)],
          customSections,
        ),
      };
    });
  };

  const removeCustomSection = (sectionId) => {
    setResume((prev) => {
      const customSections = prev.customSections.filter((section) => section.id !== sectionId);
      const sectionKey = toCustomSectionKey(sectionId);
      const { [sectionKey]: removedStyle, ...remainingStyles } = normalizeDesignSettings(prev.designSettings).sections;
      void removedStyle;
      return {
        ...prev,
        customSections,
        sectionOrder: normalizeSectionOrder(
          prev.sectionOrder.filter((key) => key !== sectionKey),
          customSections,
        ),
        designSettings: {
          ...normalizeDesignSettings(prev.designSettings),
          sections: remainingStyles,
        },
      };
    });
  };

  const renameCustomSection = (sectionId, name) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? { ...section, name }
          : section
      )),
    }));
  };

  const setCustomSectionType = (sectionId, typeId) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? { ...section, typeId, entries: [] }
          : section
      )),
    }));
  };

  const addCustomSectionEntry = (sectionId) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? { ...section, entries: [...section.entries, createEmptyCustomEntry(section.typeId)] }
          : section
      )),
    }));
  };

  const updateCustomSectionEntry = (sectionId, entryId, field, value) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? {
            ...section,
            entries: section.entries.map((entry) => (
              entry.id === entryId
                ? { ...entry, values: { ...entry.values, [field]: value } }
                : entry
            )),
          }
          : section
      )),
    }));
  };

  const duplicateCustomSectionEntry = (sectionId, entryId) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => {
        if (section.id !== sectionId) return section;
        const index = section.entries.findIndex((entry) => entry.id === entryId);
        if (index < 0) return section;
        const duplicate = {
          ...section.entries[index],
          id: createId('entry'),
          collapsed: false,
          values: { ...section.entries[index].values },
        };
        const entries = [...section.entries];
        entries.splice(index + 1, 0, duplicate);
        return { ...section, entries };
      }),
    }));
  };

  const removeCustomSectionEntry = (sectionId, entryId) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? { ...section, entries: section.entries.filter((entry) => entry.id !== entryId) }
          : section
      )),
    }));
  };

  const toggleCustomSectionEntryCollapse = (sectionId, entryId) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => (
        section.id === sectionId
          ? {
            ...section,
            entries: section.entries.map((entry) => (
              entry.id === entryId
                ? { ...entry, collapsed: !entry.collapsed }
                : entry
            )),
          }
          : section
      )),
    }));
  };

  const reorderCustomSectionEntries = (sectionId, fromIndex, toIndex) => {
    setResume((prev) => ({
      ...prev,
      customSections: prev.customSections.map((section) => {
        if (section.id !== sectionId) return section;
        const reordered = moveItemInArray(section.entries, fromIndex, toIndex);
        if (reordered === section.entries) return section;
        return { ...section, entries: reordered };
      }),
    }));
  };

  const moveCustomSectionEntry = (sectionId, index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    reorderCustomSectionEntries(sectionId, index, targetIndex);
  };

  return (
    <ResumeContext.Provider
      value={{
        resume,
        updatePersonalInfo,
        addEntry,
        updateEntry,
        removeEntry,
        addSkill,
        removeSkill,
        reorderSkills,
        reorderSections,
        reorderEntries,
        moveEntry,
        updateGlobalDesignSetting,
        updateSectionDesignSetting,
        addCustomSection,
        removeCustomSection,
        renameCustomSection,
        setCustomSectionType,
        addCustomSectionEntry,
        updateCustomSectionEntry,
        duplicateCustomSectionEntry,
        removeCustomSectionEntry,
        toggleCustomSectionEntryCollapse,
        reorderCustomSectionEntries,
        moveCustomSectionEntry,
        isCustomSectionKey,
        fromCustomSectionKey,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  return useContext(ResumeContext);
}
