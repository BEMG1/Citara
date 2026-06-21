import React, { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";
import type { IFigure } from "@/interfaces/IFigure";
import { useReferences } from "./ReferencesContext";
import type { Editor } from "@tiptap/react";
import type { IReference } from "@/utils/referenceUtils";

interface IFigureContext {
  figures: IFigure[];
  setFigures: (figures: IFigure[]) => void;
  addFigure: (figure: IFigure) => void;
  updateFigure: (id: string, updates: Partial<IFigure>) => void;
  removeFigure: (id: string) => void;
  clearFigures: () => void;
  selectedFigureId: string | null;
  setSelectedFigureId: (id: string | null) => void;
  editorInstance: Editor | null;
  setEditorInstance: (editor: Editor | null) => void;
}

const FigureContext = createContext<IFigureContext | undefined>(undefined);

export const FigureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [figures, setFigures] = useState<IFigure[]>([]);
  const [selectedFigureId, setSelectedFigureId] = useState<string | null>(null);
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  
  const { references, setReferences } = useReferences();

  // Sync figures from editor instance
  React.useEffect(() => {
    if (!editorInstance) return;

    const syncFiguresFromEditor = () => {
      const extracted: IFigure[] = [];
      editorInstance.state.doc.descendants((node) => {
        if (node.type.name === 'figure') {
          extracted.push({
            id: node.attrs.id,
            number: node.attrs.number,
            imageUrl: node.attrs.imageUrl,
            title: node.attrs.title,
            caption: node.attrs.caption,
            note: node.attrs.note,
            copyrightAttribution: node.attrs.attributionType ? {
              type: node.attrs.attributionType,
              title: node.attrs.attributionTitle,
              author: node.attrs.attributionAuthor,
              year: node.attrs.attributionYear,
              publisher: node.attrs.attributionPublisher,
              journal: node.attrs.attributionJournal,
              siteName: node.attrs.attributionSiteName,
              channel: node.attrs.attributionChannel,
              url: node.attrs.attributionUrl,
              license: node.attrs.attributionLicense,
            } : undefined
          });
        }
      });

      setFigures((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(extracted)) {
          // Detect deleted figures to clean up references
          setTimeout(() => {
            const extractedIds = new Set(extracted.map(f => f.id));
            const deletedFigures = prev.filter(f => !extractedIds.has(f.id));
            
            if (deletedFigures.length > 0) {
              deletedFigures.forEach(fig => {
                const refId = `fig-ref-${fig.id}`;
                let isShared = false;
                
                editorInstance.state.doc.descendants((node) => {
                  if (node.marks) {
                    for (const mark of node.marks) {
                      if (mark.type.name === 'reference' && mark.attrs.id === refId) {
                        isShared = true;
                        return false;
                      }
                    }
                  }
                });

                if (!isShared) {
                  setReferences(refs => refs.filter(r => r.id !== refId));
                }
              });
            }
          }, 0);

          return extracted;
        }
        return prev;
      });
    };

    // Initial sync
    syncFiguresFromEditor();

    // Listen to updates
    editorInstance.on('update', syncFiguresFromEditor);

    return () => {
      editorInstance.off('update', syncFiguresFromEditor);
    };
  }, [editorInstance, setReferences]);

  const syncFigureReference = useCallback((figure: IFigure, currentRefs: IReference[], setRefs: (refs: IReference[]) => void) => {
    const refId = `fig-ref-${figure.id}`;
    if (!figure.copyrightAttribution) {
      // Remove if exists
      if (currentRefs.some(r => r.id === refId)) {
        setRefs(currentRefs.filter(r => r.id !== refId));
      }
      return currentRefs.filter(r => r.id !== refId);
    }

    const attr = figure.copyrightAttribution;
    const newRef: IReference = {
      id: refId,
      type: attr.type === 'other' ? 'website' : attr.type,
      author: attr.author,
      year: attr.year,
      title: attr.title,
      url: attr.url,
      publisher: attr.publisher,
      journal: attr.journal,
      volume: attr.volume,
      issue: attr.issue,
      pages: attr.pages,
      doi: attr.doi,
      siteName: attr.siteName,
      channel: attr.channel,
    };

    let updatedRefs = [...currentRefs];
    const existingIndex = updatedRefs.findIndex(r => r.id === refId);
    
    // Si ya existe la referencia pero tal vez tenga un UUID normal, la prevencion de duplicados seria verificar titulo/autor, pero con fig-ref-id es exacto.
    if (existingIndex !== -1) {
      updatedRefs[existingIndex] = newRef;
    } else {
      updatedRefs.push(newRef);
    }
    
    setRefs(updatedRefs);
    return updatedRefs;
  }, []);

  const addFigure = useCallback((figure: IFigure) => {
    setFigures((prev) => [...prev, figure]);
    syncFigureReference(figure, references, setReferences);
  }, [references, setReferences, syncFigureReference]);

  const updateFigure = useCallback((id: string, updates: Partial<IFigure>) => {
    setFigures((prev) => {
      const next = prev.map((fig) => (fig.id === id ? { ...fig, ...updates } : fig));
      const updatedFig = next.find(f => f.id === id);
      if (updatedFig) {
        syncFigureReference(updatedFig, references, setReferences);
      }
      return next;
    });
  }, [references, setReferences, syncFigureReference]);

  const removeFigure = useCallback((id: string) => {
    setFigures((prev) => prev.filter((fig) => fig.id !== id));
    
    const refId = `fig-ref-${id}`;
    let isShared = false;

    if (editorInstance) {
      editorInstance.state.doc.descendants((node) => {
        if (node.marks) {
          for (const mark of node.marks) {
            if (mark.type.name === 'reference' && mark.attrs.id === refId) {
              isShared = true;
              return false; // Stop traversing
            }
          }
        }
      });
    }

    if (!isShared) {
      setReferences((prev) => prev.filter(r => r.id !== refId));
    }

    if (selectedFigureId === id) setSelectedFigureId(null);
  }, [setFigures, setReferences, selectedFigureId, editorInstance]);

  const clearFigures = () => {
    setFigures([]);
  };

  const value = useMemo(
    () => ({
      figures,
      setFigures,
      addFigure,
      updateFigure,
      removeFigure,
      clearFigures,
      selectedFigureId,
      setSelectedFigureId,
      editorInstance,
      setEditorInstance,
    }),
    [figures, addFigure, updateFigure, removeFigure, selectedFigureId, editorInstance],
  );

  return (
    <FigureContext.Provider value={value}>
      {children}
    </FigureContext.Provider>
  );
};

export const useFigures = () => {
  const context = useContext(FigureContext);
  if (context === undefined) {
    throw new Error("useFigures must be used within a FigureProvider");
  }
  return context;
};

export default FigureProvider;
