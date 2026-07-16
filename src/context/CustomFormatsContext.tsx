import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { customFormatsService } from '../services/supabase/customFormats';
import type {
  CustomCitationFormat,
  CustomCitationFormatInsert,
  CustomCitationFormatUpdate
} from '../services/supabase/customFormats';

interface CustomFormatsContextType {
  customFormats: CustomCitationFormat[];
  loading: boolean;
  createFormat: (format: CustomCitationFormatInsert) => Promise<CustomCitationFormat>;
  updateFormat: (id: number, format: CustomCitationFormatUpdate) => Promise<CustomCitationFormat>;
  deleteFormat: (id: number) => Promise<void>;
  refreshFormats: () => Promise<void>;
}

const CustomFormatsContext = createContext<CustomFormatsContextType | undefined>(undefined);

export const CustomFormatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customFormats, setCustomFormats] = useState<CustomCitationFormat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFormats = async () => {
    if (!user) {
      setCustomFormats([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const formats = await customFormatsService.fetchFormats(user.id);
      setCustomFormats(formats);
    } catch (error) {
      console.error('Error fetching custom formats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormats();
  }, [user]);

  const createFormat = async (format: CustomCitationFormatInsert) => {
    if (!user) throw new Error('Must be logged in to create a format');
    const formatWithUser = { ...format, user_id: user.id };
    const newFormat = await customFormatsService.createFormat(formatWithUser);
    setCustomFormats(prev => [...prev, newFormat].sort((a, b) => a.name.localeCompare(b.name)));
    return newFormat;
  };

  const updateFormat = async (id: number, format: CustomCitationFormatUpdate) => {
    const updated = await customFormatsService.updateFormat(id, format);
    setCustomFormats(prev => prev.map(f => (f.id === id ? updated : f)).sort((a, b) => a.name.localeCompare(b.name)));
    return updated;
  };

  const deleteFormat = async (id: number) => {
    await customFormatsService.deleteFormat(id);
    setCustomFormats(prev => prev.filter(f => f.id !== id));
  };

  return (
    <CustomFormatsContext.Provider
      value={{
        customFormats,
        loading,
        createFormat,
        updateFormat,
        deleteFormat,
        refreshFormats: fetchFormats
      }}
    >
      {children}
    </CustomFormatsContext.Provider>
  );
};

export const useCustomFormats = () => {
  const context = useContext(CustomFormatsContext);
  if (context === undefined) {
    throw new Error('useCustomFormats must be used within a CustomFormatsProvider');
  }
  return context;
};

export default CustomFormatsProvider;

