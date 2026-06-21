import { useEffect, useState } from "react";
import { useFigures } from "@/context/FigureContext";
import { useLanguage } from "@/context/LanguageContext";
import type { IFigure } from "@/interfaces/IFigure";

export default function FigurePropertiesPanel() {
  const { figures, selectedFigureId, updateFigure, editorInstance } = useFigures();
  const { t } = useLanguage();

  const selectedFigure = figures.find(f => f.id === selectedFigureId);

  // Local state for immediate typing (debounced sync to context & editor)
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (selectedFigure) {
      setTitle(selectedFigure.title || "");
      setCaption(selectedFigure.caption || "");
      setNote(selectedFigure.note || "");
    }
  }, [selectedFigure?.id, selectedFigure?.title, selectedFigure?.caption, selectedFigure?.note]);

  const handleUpdate = (field: keyof IFigure, value: string) => {
    if (!selectedFigureId) return;

    // Update Context
    updateFigure(selectedFigureId, { [field]: value });

    // Update Editor
    if (editorInstance) {
      // Assuming we need to find the node and update its attributes
      editorInstance.state.doc.descendants((node) => {
        if (node.type.name === 'figure' && node.attrs.id === selectedFigureId) {
          editorInstance.commands.updateAttributes('figure', { [field]: value });
          return false; // Stop traversing
        }
      });
    }
  };

  if (figures.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
        <p style={{ color: "var(--text-2)" }}>{t('figuresTabEmpty')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
        {t('figuresTab')}
      </h3>

      {!selectedFigure ? (
        <div className="p-4 rounded-lg border text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-2)", color: "var(--text-3)" }}>
          {t('figuresTabUnselected')}
        </div>
      ) : (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="p-3 rounded-lg border mb-2 flex flex-col items-center gap-2" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
             {/* Thumbnail */}
             <img src={selectedFigure.imageUrl} alt={title} className="max-h-32 object-contain rounded-md bg-white dark:bg-gray-900" />
             <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
               {t('figure')} {selectedFigure.number}
             </span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
              {t('figureTitle')} *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                handleUpdate('title', e.target.value);
              }}
              className="input-nj"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
              {t('figureCaption')}
            </label>
            <textarea
              value={caption}
              onChange={(e) => {
                setCaption(e.target.value);
                handleUpdate('caption', e.target.value);
              }}
              className="input-nj resize-y"
              rows={2}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
              {t('figureNote')}
            </label>
            <textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                handleUpdate('note', e.target.value);
              }}
              className="input-nj resize-y"
              rows={3}
            />
          </div>

          {selectedFigure.copyrightAttribution && (
            <div className="mt-4 p-3 rounded-lg border flex flex-col gap-1" style={{ borderColor: "var(--border)", background: "var(--surface-3)" }}>
              <span className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--accent)" }}>
                {t('figureApaAttribution')}
              </span>
              <span className="text-sm" style={{ color: "var(--text)" }}>
                {selectedFigure.copyrightAttribution.title} ({selectedFigure.copyrightAttribution.year})
              </span>
              <span className="text-xs" style={{ color: "var(--text-3)" }}>
                La atribución completa se gestiona en la inserción o se muestra en la Nota y en las Referencias.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
