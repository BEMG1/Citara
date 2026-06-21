import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { ICoverPageData, ICoverPageContext } from '@/interfaces/ICoverPage';

// ─── Default values ────────────────────────────────────────────────────────────

const DEFAULT_COVER_PAGE: ICoverPageData = {
  enabled: false,
  title: '',
  subtitle: '',
  authors: '',
  institution: '',
  faculty: '',
  course: '',
  teacher: '',
  city: '',
  date: '',
  logo: null,
};

// ─── Context ───────────────────────────────────────────────────────────────────

const CoverPageContext = createContext<ICoverPageContext | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

const CoverPageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [coverPage, setCoverPage] = useLocalStorage<ICoverPageData>(
    'cover_page',
    DEFAULT_COVER_PAGE,
  );

  const updateField = useCallback(
    <K extends keyof ICoverPageData>(field: K, value: ICoverPageData[K]) => {
      setCoverPage((prev: ICoverPageData) => ({ ...prev, [field]: value }));
    },
    [setCoverPage],
  );

  const resetCoverPage = useCallback(() => {
    setCoverPage(DEFAULT_COVER_PAGE);
  }, [setCoverPage]);

  const value = useMemo(
    () => ({ coverPage, setCoverPage, updateField, resetCoverPage }),
    [coverPage, setCoverPage, updateField, resetCoverPage],
  );

  return (
    <CoverPageContext.Provider value={value}>
      {children}
    </CoverPageContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCoverPage = (): ICoverPageContext => {
  const context = useContext(CoverPageContext);
  if (context === undefined) {
    throw new Error('useCoverPage must be used within a CoverPageProvider');
  }
  return context;
};

export default CoverPageProvider;
