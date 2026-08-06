import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import {
  type CitationFormat,
  CITATION_FORMATTERS,
  DEFAULT_FORMAT,
} from '@/utils/citationFormats';
import type { ICitationFormat } from '@/interfaces/ICitationFormat';
import type { CustomCitationFormat } from '@/services/supabase/customFormats';
import { StyleEngine } from '@/core/StyleEngine/StyleEngine';

const STORAGE_KEY = 'citation_format';
const CUSTOM_ID_KEY = 'custom_format_id';
const CUSTOM_CONFIG_KEY = 'custom_format_config';

const CitationFormatContext = createContext<ICitationFormat | undefined>(undefined);

const CitationFormatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [citationFormat, setCitationFormatState] = useState<CitationFormat>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'custom') {
      return 'custom';
    }
    if (stored && stored in CITATION_FORMATTERS) {
      return stored as CitationFormat;
    }
    return DEFAULT_FORMAT;
  });

  const [customFormatId, setCustomFormatId] = useState<string | undefined>(() => {
    return localStorage.getItem(CUSTOM_ID_KEY) || undefined;
  });

  const [customFormatConfig, setCustomFormatConfig] = useState<CustomCitationFormat | null>(() => {
    const stored = sessionStorage.getItem(CUSTOM_CONFIG_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as CustomCitationFormat;
      } catch (e) {
        console.error("Error parsing custom format config from sessionStorage", e);
      }
    }
    return null;
  });

  const setCitationFormat = (format: CitationFormat, customId?: string, customConfig?: CustomCitationFormat) => {
    localStorage.setItem(STORAGE_KEY, format);
    setCitationFormatState(format);
    
    if (format === 'custom') {
      if (customId) {
        localStorage.setItem(CUSTOM_ID_KEY, customId);
        setCustomFormatId(customId);
      }
      if (customConfig) {
        sessionStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(customConfig));
        setCustomFormatConfig(customConfig);
      }
    } else {
      // Clear custom format data if a standard format is selected
      localStorage.removeItem(CUSTOM_ID_KEY);
      sessionStorage.removeItem(CUSTOM_CONFIG_KEY);
      setCustomFormatId(undefined);
      setCustomFormatConfig(null);
    }
  };

  const formatter = useMemo(() => {
    if (citationFormat === 'custom') {
      // For now, custom formats fallback to APA formatter logic for string references
      return CITATION_FORMATTERS['apa7']; 
    }
    return CITATION_FORMATTERS[citationFormat as Exclude<CitationFormat, 'custom'>];
  }, [citationFormat]);

  const documentStyle = useMemo(() => {
    if (citationFormat === 'custom') {
      if (customFormatConfig) {
        return StyleEngine.resolve(customFormatConfig);
      }
      return StyleEngine.resolve('apa7'); // Fallback if custom config not yet loaded
    }
    return StyleEngine.resolve(citationFormat);
  }, [citationFormat, customFormatConfig]);

  const value = useMemo(
    () => ({ 
      citationFormat, 
      setCitationFormat, 
      formatter,
      customFormatId,
      customFormatConfig,
      documentStyle
    }),
    [citationFormat, formatter, customFormatId, customFormatConfig, documentStyle]
  );

  return (
    <CitationFormatContext.Provider value={value}>
      {children}
    </CitationFormatContext.Provider>
  );
};

export const useCitationFormat = (): ICitationFormat => {
  const context = useContext(CitationFormatContext);
  if (context === undefined) {
    throw new Error('useCitationFormat must be used within a CitationFormatProvider');
  }
  return context;
};

export default CitationFormatProvider;
