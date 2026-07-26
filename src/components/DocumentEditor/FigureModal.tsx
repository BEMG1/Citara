import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/AppContext';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import type { IFigure } from '@/interfaces/IFigure';
import { Field } from '@/components/ui/Field';
import { ReferenceFormFields } from '@/components/References/ReferenceFormFields';
import { type IReference } from '@/utils/referenceUtils';

interface FigureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (figure: Omit<IFigure, 'id' | 'number'>) => void;
  initialData?: IFigure | null;
  figureType?: 'figure' | 'table' | 'cuadro';
}

export const FigureModal: React.FC<FigureModalProps> = ({ isOpen, onClose, onSave, initialData, figureType = 'figure' }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [note, setNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [hasAttribution, setHasAttribution] = useState(false);
  const [attribution, setAttribution] = useState<NonNullable<IFigure['copyrightAttribution']>>({
    type: 'website',
    title: '',
    author: '',
    year: '',
    publisher: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
    siteName: '',
    channel: '',
    license: ''
  });

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || '');
      setCaption(initialData.caption || '');
      setNote(initialData.note || '');
      setImageUrl(initialData.imageUrl || '');
      if (initialData.copyrightAttribution) {
        setHasAttribution(true);
        setAttribution({
          ...initialData.copyrightAttribution,
        });
      } else {
        setHasAttribution(false);
      }
    } else if (isOpen && !initialData) {
      // Reset
      setTitle('');
      setCaption('');
      setNote('');
      setImageUrl('');
      setHasAttribution(false);
      setAttribution({
        type: 'website',
        title: '',
        author: '',
        year: '',
        publisher: '',
        journal: '',
        volume: '',
        issue: '',
        pages: '',
        doi: '',
        url: '',
        siteName: '',
        channel: '',
        license: ''
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert(t('figureTitleRequired'));
      return;
    }
    if (!imageUrl) {
      alert(t('figureImageRequired'));
      return;
    }

    const finalAttribution = hasAttribution ? { ...attribution } : undefined;

    onSave({
      figureType,
      imageUrl,
      title,
      caption,
      note,
      copyrightAttribution: finalAttribution,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-200"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
      >
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <ImageIcon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            {initialData ? (figureType === 'table' ? 'Editar Tabla' : figureType === 'cuadro' ? 'Editar Cuadro' : t('figure')) : (figureType === 'table' ? 'Insertar Tabla' : figureType === 'cuadro' ? 'Insertar Cuadro' : t('insertFigure'))}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors" style={{ color: 'var(--text-2)' }}>
            <X className="w-5 h-5 hover:opacity-75" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {/* Basic Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
              {t('figureBasicInfo')}
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-2)' }}>{t('figureImage')} *</label>
              {imageUrl ? (
                <div className="relative group rounded-lg overflow-hidden border mb-2" style={{ borderColor: 'var(--border)' }}>
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-nj"
                    >
                      <Upload className="w-4 h-4" /> Reemplazar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-3)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-3)' }}
                >
                  <Upload className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Click para subir imagen</span>
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <Field
              label={`${t('figureTitle')} *`}
              value={title}
              onChange={setTitle}
              placeholder="Ej. Comportamiento histórico del dólar"
            />

            <Field
              label={t('figureCaption') as string}
              value={caption}
              onChange={setCaption}
              placeholder="Explicación interna de la figura..."
              multiline
              rows={2}
            />

            <Field
              label={t('figureNote') as string}
              value={note}
              onChange={setNote}
              placeholder="Aclaraciones, abreviaturas..."
              multiline
              rows={2}
            />
          </section>

          {/* APA Attribution */}
          <section className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                {t('figureApaAttribution')}
              </h3>
              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasAttribution}
                  onChange={(e) => setHasAttribution(e.target.checked)}
                  className="rounded"
                  style={{ accentColor: 'var(--accent)' }}
                />
                Incluir atribución
              </label>
            </div>

            {hasAttribution && (
              <div className="flex flex-col gap-4 p-4 rounded-lg border" style={{ background: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <ReferenceFormFields 
                  reference={attribution as IReference} 
                  onChange={(field, value) => setAttribution(prev => ({ ...prev, [field]: value }))} 
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-4 mt-2" style={{ borderColor: 'var(--border)' }}>
                  <Field
                    label={t('figureLicense') as string}
                    value={attribution.license || ''}
                    onChange={(v) => setAttribution(prev => ({ ...prev, license: v }))}
                    colSpan
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="p-4 border-t flex justify-end gap-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-1)' }}>
          <button onClick={onClose} className="btn-nj">
            {t('cancel')}
          </button>
          <button onClick={handleSave} className="btn-nj primary">
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};
