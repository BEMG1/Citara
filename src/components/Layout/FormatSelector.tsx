import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Edit2, Trash2} from 'lucide-react';
import { useCitationFormat, useLanguage } from '@/context/AppContext';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { type CitationFormat } from '@/utils/citationFormats';
import { useCustomFormats } from '@/context/CustomFormatsContext';
import { CustomFormatModal } from '../Settings/CustomFormatModal';
import type { CustomCitationFormat } from '@/services/supabase/customFormats';
import { useAuth } from '@/context/AuthContext';

const FORMAT_ORDER: CitationFormat[] = ['apa7', 'ieee', 'upel'];

export const FormatSelector: React.FC = () => {
  const { citationFormat, setCitationFormat, customFormatId } = useCitationFormat();
  const { customFormats, deleteFormat } = useCustomFormats();
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const [isFormatDropdownOpen, setIsFormatDropdownOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formatToEdit, setFormatToEdit] = useState<CustomCitationFormat | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isFormatDropdownOpen &&
        formatDropdownRef.current &&
        !formatDropdownRef.current.contains(e.target as Node)
      ) {
        setIsFormatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFormatDropdownOpen]);

  const getFormatKey = (fmt: CitationFormat) => {
    if (fmt === 'apa7') return { label: 'formatAPA7', desc: 'formatAPA7Desc' };
    // if (fmt === 'apa6') return { label: 'formatAPA6', desc: 'formatAPA6Desc' };
    if (fmt === 'ieee') return { label: 'formatIEEE', desc: 'formatIEEEDesc' };
    if (fmt === 'upel') return { label: 'formatUPEL', desc: 'formatUPELDesc' };
    return { label: 'formatAPA7', desc: 'formatAPA7Desc' };
  };

  const activeKeys = FORMAT_ORDER.includes(citationFormat as any)
    ? getFormatKey(citationFormat as any)
    : { label: citationFormat, desc: '' };
    
  const customFormatActive = citationFormat === 'custom' && customFormatId 
    ? customFormats.find(f => f.id.toString() === customFormatId) 
    : undefined;

  const handleDelete = async (e: React.MouseEvent, id: number, name: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the format "${name}"?`)) {
      await deleteFormat(id);
      if (citationFormat === 'custom' && customFormatId === id.toString()) {
        setCitationFormat('apa7');
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, format: CustomCitationFormat) => {
    e.stopPropagation();
    setFormatToEdit(format);
    setIsModalOpen(true);
    setIsFormatDropdownOpen(false);
  };

  const handleCreate = () => {
    setFormatToEdit(null);
    setIsModalOpen(true);
    setIsFormatDropdownOpen(false);
  };

  return (
    <>
      <div className="relative" ref={formatDropdownRef}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              id="citation-format-selector"
              onClick={() => setIsFormatDropdownOpen((prev) => !prev)}
              className="btn-nj cursor-pointer"
              style={isFormatDropdownOpen ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)' } : {}}
            >
              <span style={{ fontWeight: 600 }}>
                {customFormatActive ? customFormatActive.name : t(activeKeys.label as any)}
              </span>
              <ChevronDown size={14} strokeWidth={1.6} className={`transition-transform duration-200 ${isFormatDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--text-3)' }} />
            </button>
          </TooltipTrigger>
          <TooltipContent className="z-[100]">
            <p>{t('formatSelectorTitle') || 'Citation Format'}</p>
          </TooltipContent>
        </Tooltip>

        {isFormatDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl z-50 overflow-hidden anim-slide-down" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-popover)' }}>
            
            {/* Built-in formats */}
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                {t('builtInFormats') as string}
              </p>
            </div>
            <div className="p-1.5 space-y-0.5">
              {FORMAT_ORDER.map((fmt) => {
                const keys = getFormatKey(fmt);
                const isActive = fmt === citationFormat;
                return (
                  <button
                    key={fmt}
                    id={`format-option-${fmt}`}
                    onClick={() => { setCitationFormat(fmt); setIsFormatDropdownOpen(false); }}
                    className="w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/10"
                    style={{
                      border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                      background: isActive ? 'var(--accent-soft)' : undefined,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-semibold" style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                        {t(keys.label as any)}
                      </span>
                      <span className="block text-xs mt-0.5 leading-snug" style={{ color: 'var(--text-2)' }}>
                        {t(keys.desc as any)}
                      </span>
                    </div>
                    {isActive && <Check size={14} strokeWidth={1.6} className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />}
                  </button>
                );
              })}
            </div>

            {/* Custom formats */}
            <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-t" style={{ borderColor: 'var(--border)', borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                {t('customFormats') as string}
              </p>
            </div>
            <div className="p-1.5 space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
              {!user ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="opacity-50 cursor-not-allowed">
                      <div
                        className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all"
                        style={{ color: 'var(--accent)' }}
                      >
                        <Plus size={16} strokeWidth={2} />
                        <span className="text-sm font-semibold">{t('createCustomFormat') as string}</span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="z-[100]">
                    <p>{t('loginRequiredFeature') as string}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <>
                  {customFormats.map((fmt) => {
                    const isActive = citationFormat === 'custom' && customFormatId === fmt.id.toString();
                    return (
                      <div
                        key={fmt.id}
                        className="group flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10"
                        style={{
                          border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                          background: isActive ? 'var(--accent-soft)' : undefined,
                        }}
                      >
                        <button
                          className="flex-1 text-left flex items-center min-w-0 cursor-pointer"
                          onClick={() => { 
                            setCitationFormat('custom', fmt.id.toString(), fmt); 
                            setIsFormatDropdownOpen(false); 
                          }}
                        >
                          <span className="block text-sm font-semibold truncate pr-2" style={{ color: isActive ? 'var(--accent)' : 'var(--text)' }}>
                            {fmt.name}
                          </span>
                        </button>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => handleEdit(e, fmt)}
                            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-blue-500"
                            title="Edit format"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, fmt.id, fmt.name)}
                            className="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 hover:text-red-500"
                            title="Delete format"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {isActive && <Check size={14} strokeWidth={1.6} className="shrink-0 ml-2" style={{ color: 'var(--accent)' }} />}
                      </div>
                    );
                  })}
                  
                  {Number(profile?.userType) !== 1 && customFormats.length >= 1 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="opacity-50 cursor-not-allowed">
                          <div
                            className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all"
                            style={{ color: 'var(--accent)' }}
                          >
                            <Plus size={16} strokeWidth={2} />
                            <span className="text-sm font-semibold">{t('createCustomFormat') as string}</span>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="z-[100]">
                        <p>Para crear más formatos personalizados actualiza tu plan a uno premium</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <button
                      onClick={handleCreate}
                      className="w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                      style={{ color: 'var(--accent)' }}
                    >
                      <Plus size={16} strokeWidth={2} />
                      <span className="text-sm font-semibold">{t('createCustomFormat') as string}</span>
                    </button>
                  )}
                </>
              )}
            </div>

          </div>
        )}
      </div>

      <CustomFormatModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        formatToEdit={formatToEdit}
      />
    </>
  );
};
