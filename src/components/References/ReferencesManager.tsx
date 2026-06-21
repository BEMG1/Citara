import { useState } from 'react';
import { useReferences, useCitationFormat, useLanguage } from '@/context/AppContext';
import { FORMAT_CONFIGS } from '@/utils/citationFormats';
import {
  Plus, Trash2, ChevronDown, ChevronUp,
  BookOpen, Copy, Check, ArrowUpDown,
} from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

import {
  type IReference,
  getYear
} from '@/utils/referenceUtils';

import { ReferenceFormFields } from './ReferenceFormFields';

const ReferencesManager: React.FC = () => {
  const { references, setReferences } = useReferences();
  const { citationFormat, formatter } = useCitationFormat();
  const { language, t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSorted, setIsSorted] = useState(false);

  const addReference = () => {
    const newRef: IReference = {
      id: crypto.randomUUID(),
      type: 'book',
      author: '',
      year: '',
      title: '',
    };
    setReferences((prev) => [...prev, newRef]);
    setExpandedId(newRef.id);
  };

  const removeReference = (id: string) => {
    setReferences((prev) => prev.filter((ref) => ref.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const updateReference = (id: string, field: keyof IReference, value: string) => {
    setReferences((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, [field]: value } : ref))
    );
  };

  const handleCopy = async (ref: IReference) => {
    await navigator.clipboard.writeText(formatter.formatReference(ref, language));
    setCopiedId(ref.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort: alphabetical for APA, keep insertion order for IEEE
  const displayRefs =
    isSorted && formatter.sortMode === 'alphabetical'
      ? [...references].sort((a, b) => a.author.localeCompare(b.author, 'es'))
      : references;

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 mb-4">
        <button
          onClick={addReference}
          className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md transition-colors"
          style={{ border: '2px dashed var(--border)', background: 'var(--surface)', color: 'var(--text-2)', fontFamily: 'var(--ui-font)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-2)'; }}
        >
          <Plus size={16} strokeWidth={1.6} className="mr-2" style={{ color: 'var(--text-3)' }} />
          {t('addReference')}
        </button>
        {references.length > 1 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsSorted(!isSorted)}
                className="btn-nj sm"
              style={isSorted ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' } : {}}
              >
                <ArrowUpDown className="h-4 w-4 mr-1.5" />
                {t('sortAZ')}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('sortAZTooltip')}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>

      {isSorted && (
        <p className="text-xs mb-3 text-center" style={{ color: 'var(--accent)', fontFamily: 'var(--mono-font)' }}>
          {t('showingExportOrder')}
        </p>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-3">
        {references.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-3)' }}>
            <BookOpen size={36} strokeWidth={1.4} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('noReferences')}</p>
            <p className="text-xs mt-1">{t('noReferencesHint')}</p>
          </div>
        ) : (
          displayRefs.map((ref, index) => {
            const isIncomplete = !ref.author.trim() || !ref.title.trim();
            return (
              <div
                key={ref.id}
                className="rounded-md overflow-hidden"
                style={{ border: `1px solid ${isIncomplete ? 'var(--warn)' : 'var(--border)'}`, background: 'var(--surface)' }}
              >
                <div
                  className="flex justify-between items-center px-4 py-3 cursor-pointer transition-colors"
                  style={{ background: 'var(--surface-2)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-3)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'}
                  onClick={() => setExpandedId(expandedId === ref.id ? null : ref.id)}
                >
                  <div className="flex-1 truncate mr-2 min-w-0">
                    <span className="font-medium text-sm mr-2" style={{ color: 'var(--text-3)', fontFamily: 'var(--mono-font)' }}>
                      #{index + 1}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--text-2)' }}>
                      {ref.author ? `${ref.author} (${getYear(ref.year, language)})` : t('newReference')}
                    </span>
                    {isIncomplete && (
                      <span className="ml-2 text-xs font-medium" style={{ color: 'var(--warn)' }}>
                        {t('incompleteRef')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(ref); }} className="ib-nj" style={{ width: 28, height: 28 }}>
                          {copiedId === ref.id
                            ? <Check size={13} strokeWidth={1.6} style={{ color: 'var(--ok)' }} />
                            : <Copy size={13} strokeWidth={1.6} />
                          }
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('copyRefTooltip')}</p></TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button onClick={(e) => { e.stopPropagation(); removeReference(ref.id); }} className="ib-nj" style={{ width: 28, height: 28 }}>
                          <Trash2 size={13} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent><p>{t('deleteRefTooltip')}</p></TooltipContent>
                    </Tooltip>
                    {expandedId === ref.id
                      ? <ChevronUp size={16} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                      : <ChevronDown size={16} strokeWidth={1.6} style={{ color: 'var(--text-3)' }} />
                    }
                  </div>
                </div>

                {expandedId === ref.id && (
                  <div className="p-4 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
                    <ReferenceFormFields 
                      reference={ref}
                      onChange={(field, value) => updateReference(ref.id, field, value)}
                    />
                    <div className="mt-4 p-3 rounded-md" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--mono-font)' }}>
                        {t('preview')} · {FORMAT_CONFIGS[citationFormat].label}
                      </p>
                      <p className="text-sm" style={{ paddingLeft: '2em', textIndent: '-2em', color: 'var(--text)', fontFamily: 'var(--doc-font)' }}>
                        {formatter.formatReferenceJSX(ref, language)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ReferencesManager;
