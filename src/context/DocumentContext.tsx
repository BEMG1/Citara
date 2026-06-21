import React, { createContext, useContext, useMemo, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IDocument } from "@/interfaces/IDocument";
import { useCitationFormat } from "./CitationFormatContext";

export type PageNumberPosition = 'top-right' | 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-left' | 'top-center' | null;

interface IDocumentExtended extends IDocument {
  pageNumberPosition: PageNumberPosition;
  setPageNumberPosition: (pos: PageNumberPosition) => void;
  startNumberingOnCover: boolean;
  setStartNumberingOnCover: (val: boolean) => void;
}

const DocumentContext = createContext<IDocumentExtended | undefined>(undefined);

const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documentText, setDocumentText] = useLocalStorage<string>("documentText", "");
  const [documentTitle, setDocumentTitle] = useLocalStorage<string>(
    "documentTitle",
    "Document_Citara",
  );

  const { citationFormat } = useCitationFormat();

  const [pageNumberPosition, setPageNumberPosition] = useLocalStorage<PageNumberPosition>(
    "pageNumberPosition",
    null
  );
  
  const [startNumberingOnCover, setStartNumberingOnCover] = useLocalStorage<boolean>(
    "startNumberingOnCover",
    true
  );

  // If format changes, reset the page number position to default
  useEffect(() => {
    setPageNumberPosition(null);
  }, [citationFormat, setPageNumberPosition]);

  const [complianceScore, setComplianceScore] = React.useState<number | null>(null);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = React.useState<boolean>(false);

  
  const haveText = useMemo(() => {
    if (!documentText) return false;
    
    const textoLimpio = documentText
    .replace(/<[^>]*>?/gm, '')
    .replace(/&nbsp;/g, '');
    
    return textoLimpio.trim().length > 0;
  }, [documentText]);

  const value = useMemo(
    () => ({
      documentText,
      setDocumentText,
      documentTitle,
      setDocumentTitle,
      haveText,
      complianceScore,
      setComplianceScore,
      isComplianceModalOpen,
      setIsComplianceModalOpen,
      pageNumberPosition,
      setPageNumberPosition,
      startNumberingOnCover,
      setStartNumberingOnCover,
    }),
    [documentText, setDocumentText, documentTitle, setDocumentTitle, haveText, complianceScore, isComplianceModalOpen, pageNumberPosition, setPageNumberPosition, startNumberingOnCover, setStartNumberingOnCover]
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error("useDocument must be used within a DocumentProvider");
  }
  return context;
};

export default DocumentProvider;
