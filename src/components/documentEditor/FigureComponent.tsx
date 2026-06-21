import React from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useLanguage, useFigures } from '@/context/AppContext';
import { useEffect } from 'react';

export const FigureComponent: React.FC<NodeViewProps> = ({ node, selected }) => {
  const { t } = useLanguage();
  const { setSelectedFigureId } = useFigures();
  const {
    id,
    number,
    imageUrl,
    title,
    caption,
    note,
    attributionType,
    attributionTitle,
    attributionAuthor,
    attributionYear,
    attributionJournal,
    attributionPublisher,
    attributionSiteName,
    attributionChannel
  } = node.attrs;

  useEffect(() => {
    if (selected && id) {
      setSelectedFigureId(id);
    } else if (!selected) {
      setSelectedFigureId(null);
    }

    return () => {
      // Clear selection if this exact component was selected and gets unmounted
      if (selected) {
        setSelectedFigureId(null);
      }
    };
  }, [selected, id, setSelectedFigureId]);

  // Construir la nota final a mostrar. Puede ser la 'note' manual,
  // y si hay atribución APA, se debe agregar el texto de adaptación.
  let displayNote = note || '';
  if (attributionType) {
    const isAdapted = true; // Por simplificación asumimos que siempre es 'Adaptado de'
    const notePrefix = isAdapted ? t('noteAdaptedFrom') : t('noteFrom');
    
    // Formato básico de atribución APA
    const parts = [];
    if (attributionTitle) parts.push(`"${attributionTitle}"`);
    if (attributionAuthor) parts.push(`por ${attributionAuthor}`);
    if (attributionYear) parts.push(attributionYear);
    const sourceName = attributionJournal || attributionPublisher || attributionSiteName || attributionChannel;
    if (sourceName) parts.push(sourceName);

    const attributionText = parts.length > 0 ? `${notePrefix} ${parts.join(', ')}.` : '';
    
    if (displayNote && attributionText) {
      displayNote = `${displayNote} ${attributionText}`;
    } else if (attributionText) {
      displayNote = attributionText;
    }
  }

  return (
    <NodeViewWrapper 
      className="relative mb-6 figure-node rounded-md"
      style={{ 
        boxShadow: selected ? '0 0 0 2px var(--accent)' : 'none',
        padding: selected ? '4px' : '0'
      }}
    >
      <div className="flex flex-col text-left font-serif leading-relaxed">
        {/* Figure Number (Bold) */}
        <div className="font-bold mb-1">
          {t('figure')} {number || '?'}
        </div>
        
        {/* Figure Title (Italic) */}
        <div className="italic mb-3">
          {title || `[${t('figureTitleRequired')}]`}
        </div>

        {imageUrl ? (
          <img src={imageUrl} alt={title || 'Figure'} className="max-w-full h-auto mb-3 object-contain" />
        ) : (
          <div className="w-full h-32 flex items-center justify-center mb-3 border nj-bg-err-s nj-err nj-border-soft">
            {t('figureImageRequired')}
          </div>
        )}

        {/* Caption */}
        {caption && (
          <div className="mb-2">
            {caption}
          </div>
        )}

        {/* Note */}
        {displayNote && (
          <div className="text-sm">
            {displayNote}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};
