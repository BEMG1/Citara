import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCustomFormats } from '@/context/CustomFormatsContext';
import type { CustomCitationFormat, CustomCitationFormatInsert } from '@/services/supabase/customFormats';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useCitationFormat } from '@/context/CitationFormatContext';

interface CustomFormatModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatToEdit?: CustomCitationFormat | null;
}

const tabKeys = ['general', 'spacing', 'page', 'headings', 'review'] as const;
type TabKey = typeof tabKeys[number];

export const CustomFormatModal: React.FC<CustomFormatModalProps> = ({
  isOpen,
  onClose,
  formatToEdit
}) => {
  const { createFormat, updateFormat, customFormats } = useCustomFormats();
  const { citationFormat, customFormatId, setCitationFormat } = useCitationFormat();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultValues: CustomCitationFormatInsert = {
    user_id: '',
    name: '',
    font_family: 'Times New Roman',
    font_size: 12,
    font_color: '#000000',
    text_alignment: 'Justified',
    line_spacing: 2.0,
    paragraph_before: 0,
    paragraph_after: 0,
    first_line_indent: 1.27,
    left_indent: 0,
    right_indent: 0,
    margin_top: 2.54,
    margin_bottom: 2.54,
    margin_left: 2.54,
    margin_right: 2.54,
    paper_size: 'Letter',
    orientation: 'Portrait',
    header_distance: 1.27,
    footer_distance: 1.27,
    page_number_enabled: true,
    page_number_position: 'TopRight',
    heading1_size: 16,
    heading1_bold: true,
    heading1_italic: false,
    heading1_alignment: 'Left',
    heading2_size: 14,
    heading2_bold: true,
    heading2_italic: false,
    heading2_alignment: 'Left',
    heading3_size: 13,
    heading3_bold: true,
    heading3_italic: false,
    heading3_alignment: 'Left',
    hanging_indent: 1.27,
    reference_spacing: 2.0
  };

  const [formData, setFormData] = useState<CustomCitationFormatInsert>(defaultValues);
  
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [visitedTabs, setVisitedTabs] = useState<Set<TabKey>>(new Set(['general']));

  useEffect(() => {
    if (formatToEdit) {
      const { id, created_at, updated_at, ...rest } = formatToEdit;
      setFormData(rest);
    } else {
      setFormData(defaultValues);
    }
    setError(null);
    setActiveTab('general');
    setVisitedTabs(new Set(['general']));
  }, [formatToEdit, isOpen]);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    
    if (type === 'number') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    } else if (type === 'checkbox') {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const isGeneralTabValid = () => {
    if (!formData.name.trim()) return false;
    const isDuplicate = customFormats.some(f => 
      f.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      f.id !== formatToEdit?.id
    );
    if (isDuplicate) return false;
    if (formData.font_size < 1) return false;
    return true;
  };

  const isSpacingTabValid = () => {
    if (formData.line_spacing < 0.01) return false;
    const numerics = [formData.paragraph_before, formData.paragraph_after, formData.first_line_indent, formData.left_indent, formData.right_indent];
    return !numerics.some(val => val < 0);
  };

  const isPageTabValid = () => {
    const numerics = [formData.margin_top, formData.margin_bottom, formData.margin_left, formData.margin_right, formData.header_distance, formData.footer_distance];
    return !numerics.some(val => val < 0);
  };

  const isHeadingsTabValid = () => {
    const headingSizes = [formData.heading1_size, formData.heading2_size, formData.heading3_size];
    const otherNumerics = [formData.hanging_indent, formData.reference_spacing];
    return !headingSizes.some(val => val < 1) && !otherNumerics.some(val => val < 0);
  };

  const isTabValid = (tab: TabKey) => {
    switch (tab) {
      case 'general': return isGeneralTabValid();
      case 'spacing': return isSpacingTabValid();
      case 'page': return isPageTabValid();
      case 'headings': return isHeadingsTabValid();
      case 'review': return true;
      default: return true;
    }
  };

  const getTabStatus = (tab: TabKey): 'Unvisited' | 'Complete' | 'Incomplete' => {
    if (tab === 'review') return 'Unvisited'; // Review tab itself doesn't need validation tracking in the same way
    if (!visitedTabs.has(tab)) return 'Unvisited';
    return isTabValid(tab) ? 'Complete' : 'Incomplete';
  };

  const allRequiredSectionsComplete = () => {
    return isGeneralTabValid() && isSpacingTabValid() && isPageTabValid() && isHeadingsTabValid();
  };

  const handleTabChange = (val: string) => {
    const newTab = val as TabKey;
    // We can allow free navigation if they just click tabs, but maybe check if moving forward
    setError(null);
    setActiveTab(newTab);
    setVisitedTabs(prev => new Set(prev).add(newTab));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRequiredSectionsComplete()) {
      setError("Hay valores inválidos. Los tamaños de fuente deben ser mínimo 1, el interlineado mínimo 0.01 y los demás márgenes/sangrías mínimo 0.");
      // Find first incomplete tab
      const firstIncomplete = tabKeys.find(k => k !== 'review' && !isTabValid(k));
      if (firstIncomplete) {
        setActiveTab(firstIncomplete);
        setVisitedTabs(prev => new Set(prev).add(firstIncomplete));
      }
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      let resultFormat;
      if (formatToEdit) {
        resultFormat = await updateFormat(formatToEdit.id, formData);
        // Si el formato que se está editando es el actualmente seleccionado, actualizar el contexto
        if (citationFormat === 'custom' && customFormatId === formatToEdit.id.toString()) {
          setCitationFormat('custom', resultFormat.id.toString(), resultFormat);
        }
      } else {
        resultFormat = await createFormat(formData);
        // Seleccionar automáticamente el formato recién creado
        setCitationFormat('custom', resultFormat.id.toString(), resultFormat);
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error saving custom format.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-md border p-2 text-sm focus:outline-none focus:ring-1";
  const labelClass = "block text-sm font-medium mb-1";
  const groupClass = "grid grid-cols-2 gap-4 mb-4";

  const renderTabIndicator = (tab: TabKey) => {
    const status = getTabStatus(tab);
    if (status === 'Complete') {
      return <CheckCircle2 size={14} className="text-green-500" />;
    }
    if (status === 'Incomplete') {
      return <span className="w-2 h-2 rounded-full bg-red-500 ml-1" />;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div 
        ref={modalRef}
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
      >
        <div className="flex items-center justify-between p-6 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--ui-font)' }}>
              {formatToEdit ? 'Edit Custom Format' : 'Create Custom Citation Format'}
            </h2>
            <p className="text-sm opacity-70">Configure the formatting rules for your custom standard.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="flex flex-wrap gap-1 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <TabsList className="bg-transparent p-0 h-auto gap-1 flex-wrap">
                <TabsTrigger 
                  value="general"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                  style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
                >
                  General {renderTabIndicator('general')}
                </TabsTrigger>
                <TabsTrigger 
                  value="spacing"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                  style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
                >
                  Spacing {renderTabIndicator('spacing')}
                </TabsTrigger>
                <TabsTrigger 
                  value="page"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                  style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
                >
                  Page {renderTabIndicator('page')}
                </TabsTrigger>
                <TabsTrigger 
                  value="headings"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                  style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
                >
                  Headings {renderTabIndicator('headings')}
                </TabsTrigger>
                {/* <TabsTrigger 
                  value="review"
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                  style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
                >
                  Review
                </TabsTrigger> */}
              </TabsList>
            </div>

            <form id="customFormatForm" onSubmit={handleSubmit}>
              <TabsContent value="general" className="mt-0 outline-none">
                <div className="mb-4">
                  <label className={labelClass}>Format Name *</label>
                  <input
                    type="text" name="name" maxLength={100} required
                    value={formData.name} onChange={handleChange}
                    placeholder="E.g. Universidad Nacional"
                    className={inputClass}
                    style={{ background: 'var(--bg)', borderColor: !formData.name.trim() && visitedTabs.has('general') ? 'red' : 'var(--border)', color: 'var(--text)' }}
                  />
                  {!formData.name.trim() && visitedTabs.has('general') && (
                    <p className="text-red-500 text-xs mt-1">Name is required</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Font Family</label>
                  <select
                    name="font_family" value={formData.font_family} onChange={handleChange}
                    className={inputClass}
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  >
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Cambria">Cambria</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Garamond">Garamond</option>
                  </select>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Font Size</label>
                    <input type="number" name="font_size" min={1} max={72} value={formData.font_size} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.font_size < 1 ? 'red' : 'var(--border)' }} />
                    {formData.font_size < 1 && visitedTabs.has('general') && (
                      <p className="text-red-500 text-xs mt-1">Debe ser mínimo 1</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Font Color</label>
                    <input type="color" name="font_color" value={formData.font_color} onChange={handleChange} className="w-full h-9 rounded cursor-pointer" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Alignment</label>
                  <select name="text_alignment" value={formData.text_alignment} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                    <option value="Left">Left</option>
                    <option value="Justified">Justified</option>
                    <option value="Center">Center</option>
                    <option value="Right">Right</option>
                  </select>
                </div>
              </TabsContent>

              <TabsContent value="spacing" className="mt-0 outline-none">
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Line Spacing</label>
                    <select name="line_spacing" value={formData.line_spacing} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.line_spacing < 0 ? 'red' : 'var(--border)' }}>
                      <option value={1.0}>Single (1.0)</option>
                      <option value={1.15}>1.15</option>
                      <option value={1.5}>1.5</option>
                      <option value={2.0}>Double (2.0)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>First Line Indent (cm)</label>
                    <input type="number" step="0.01" min="0" name="first_line_indent" value={formData.first_line_indent} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.first_line_indent < 0 ? 'red' : 'var(--border)' }} />
                    {formData.first_line_indent < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Paragraph Before (pt)</label>
                    <input type="number" min="0" name="paragraph_before" value={formData.paragraph_before} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.paragraph_before < 0 ? 'red' : 'var(--border)' }} />
                    {formData.paragraph_before < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Paragraph After (pt)</label>
                    <input type="number" min="0" name="paragraph_after" value={formData.paragraph_after} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.paragraph_after < 0 ? 'red' : 'var(--border)' }} />
                    {formData.paragraph_after < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Left Indent (cm)</label>
                    <input type="number" step="0.01" min="0" name="left_indent" value={formData.left_indent} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.left_indent < 0 ? 'red' : 'var(--border)' }} />
                    {formData.left_indent < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Right Indent (cm)</label>
                    <input type="number" step="0.01" min="0" name="right_indent" value={formData.right_indent} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.right_indent < 0 ? 'red' : 'var(--border)' }} />
                    {formData.right_indent < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="page" className="mt-0 outline-none">
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Top Margin (cm)</label>
                    <input type="number" step="0.01" min="0" name="margin_top" value={formData.margin_top} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.margin_top < 0 ? 'red' : 'var(--border)' }} />
                    {formData.margin_top < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Bottom Margin (cm)</label>
                    <input type="number" step="0.01" min="0" name="margin_bottom" value={formData.margin_bottom} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.margin_bottom < 0 ? 'red' : 'var(--border)' }} />
                    {formData.margin_bottom < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Left Margin (cm)</label>
                    <input type="number" step="0.01" min="0" name="margin_left" value={formData.margin_left} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.margin_left < 0 ? 'red' : 'var(--border)' }} />
                    {formData.margin_left < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Right Margin (cm)</label>
                    <input type="number" step="0.01" min="0" name="margin_right" value={formData.margin_right} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.margin_right < 0 ? 'red' : 'var(--border)' }} />
                    {formData.margin_right < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Paper Size</label>
                    <select name="paper_size" value={formData.paper_size} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                      <option value="Letter">Letter</option>
                      <option value="A4">A4</option>
                      <option value="Legal">Legal</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Orientation</label>
                    <select name="orientation" value={formData.orientation} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                      <option value="Portrait">Portrait</option>
                      <option value="Landscape">Landscape</option>
                    </select>
                  </div>
                </div>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Header Distance (cm)</label>
                    <input type="number" step="0.01" min="0" name="header_distance" value={formData.header_distance} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.header_distance < 0 ? 'red' : 'var(--border)' }} />
                    {formData.header_distance < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Footer Distance (cm)</label>
                    <input type="number" step="0.01" min="0" name="footer_distance" value={formData.footer_distance} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.footer_distance < 0 ? 'red' : 'var(--border)' }} />
                    {formData.footer_distance < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                </div>
                <div className="mb-4 flex items-center gap-2">
                  <input type="checkbox" name="page_number_enabled" checked={formData.page_number_enabled} onChange={handleChange} className="w-4 h-4 rounded cursor-pointer" />
                  <label className="text-sm font-medium">Enable Page Numbers</label>
                </div>
                {formData.page_number_enabled && (
                  <div className="mb-4">
                    <label className={labelClass}>Page Number Position</label>
                    <select name="page_number_position" value={formData.page_number_position} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                      <option value="TopRight">Top Right</option>
                      <option value="TopLeft">Top Left</option>
                      <option value="BottomCenter">Bottom Center</option>
                      <option value="BottomRight">Bottom Right</option>
                    </select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="headings" className="mt-0 outline-none">
                {[1, 2, 3].map(level => (
                  <div key={level} className="mb-6 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
                    <h3 className="font-bold mb-3">Heading {level}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className={labelClass}>Size</label>
                        <input type="number" min="1" name={`heading${level}_size`} value={(formData as any)[`heading${level}_size`]} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: (formData as any)[`heading${level}_size`] < 1 ? 'red' : 'var(--border)' }} />
                        {(formData as any)[`heading${level}_size`] < 1 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 1</p>}
                      </div>
                      <div>
                        <label className={labelClass}>Alignment</label>
                        <select name={`heading${level}_alignment`} value={(formData as any)[`heading${level}_alignment`]} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
                          <option value="Left">Left</option>
                          <option value="Center">Center</option>
                          <option value="Right">Right</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 md:mt-6">
                        <input type="checkbox" name={`heading${level}_bold`} checked={(formData as any)[`heading${level}_bold`]} onChange={handleChange} className="w-4 h-4 rounded cursor-pointer" />
                        <label className="text-sm font-medium">Bold</label>
                      </div>
                      <div className="flex items-center gap-2 md:mt-6">
                        <input type="checkbox" name={`heading${level}_italic`} checked={(formData as any)[`heading${level}_italic`]} onChange={handleChange} className="w-4 h-4 rounded cursor-pointer" />
                        <label className="text-sm font-medium">Italic</label>
                      </div>
                    </div>
                  </div>
                ))}
                
                <h3 className="font-bold mb-3 mt-6">References</h3>
                <div className={groupClass}>
                  <div>
                    <label className={labelClass}>Hanging Indent (cm)</label>
                    <input type="number" step="0.01" min="0" name="hanging_indent" value={formData.hanging_indent} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.hanging_indent < 0 ? 'red' : 'var(--border)' }} />
                    {formData.hanging_indent < 0 && <p className="text-red-500 text-xs mt-1">Debe ser mínimo 0</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Reference Spacing</label>
                    <select name="reference_spacing" value={formData.reference_spacing} onChange={handleChange} className={inputClass} style={{ background: 'var(--bg)', borderColor: formData.reference_spacing < 0 ? 'red' : 'var(--border)' }}>
                      <option value={1.0}>1.0</option>
                      <option value={1.5}>1.5</option>
                      <option value={2.0}>2.0</option>
                    </select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="review" className="mt-0 outline-none">
                <div className="p-6 text-center">
                  {allRequiredSectionsComplete() ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-2">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold">Ready to Save</h3>
                      <p className="text-sm opacity-70">Your custom format is ready to be saved.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-2">
                        <AlertCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold">Action Required</h3>
                      <p className="text-sm opacity-70">Some sections still require your attention.</p>
                      
                      <div className="w-full max-w-sm mt-4 text-left">
                        <ul className="space-y-2">
                          {tabKeys.filter(k => k !== 'review' && !isTabValid(k)).map(k => (
                            <li key={k}>
                              <button
                                type="button"
                                onClick={() => handleTabChange(k)}
                                className="w-full p-3 rounded-lg flex items-center justify-between border hover:bg-black/5 transition-colors"
                                style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}
                              >
                                <span className="capitalize">{k}</span>
                                <ArrowRight size={16} className="opacity-50" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </form>
          </Tabs>
        </div>

        <div className="p-4 border-t flex items-center justify-between shrink-0 gap-4" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <span className="text-xs font-medium opacity-70">
            Haz clic en las pestañas superiores para navegar por las secciones.
          </span>
          <button 
            type="submit" 
            form="customFormatForm"
            disabled={loading || !allRequiredSectionsComplete()}
            className="px-6 py-2 rounded-lg text-sm font-medium cursor-pointer flex items-center gap-2 text-white transition-all hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 shadow-sm disabled:opacity-50 disabled:hover:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none shrink-0"
            style={{ background: 'var(--accent)' }}
          >
            <Save size={16} />
            {loading ? 'Guardando...' : 'Guardar Formato'}
          </button>
        </div>
      </div>
    </div>
  );
};

