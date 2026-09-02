/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo } from 'react';
import { getResumeStyle } from '../../utils/designSettings';

const ResumeStyleContext = createContext(null);

export function StyleProvider({ designSettings, fitSettings, children }) {
  const value = useMemo(
    () => getResumeStyle(designSettings, fitSettings),
    [designSettings, fitSettings],
  );

  return (
    <ResumeStyleContext.Provider value={value}>
      {children}
    </ResumeStyleContext.Provider>
  );
}

export function useResumeStyle() {
  const context = useContext(ResumeStyleContext);
  if (!context) {
    throw new Error('useResumeStyle must be used within a StyleProvider');
  }
  return context;
}
