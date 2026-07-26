import { useRef, useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { Upload, Trash2, Link as LinkIcon, Unlink, ChevronDown, BookOpen, Bold, Italic, Underline as UnderlineIcon, Eraser, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Indent } from 'lucide-react';
import { useDocument, useReferences, useLanguage, useCitationFormat, useCoverPage, useFigures } from '@/context/AppContext';
import { useEditor, EditorContent } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { ReferenceMark } from './ReferenceMark';
import { getReferenceText, type IReference, getYear } from '@/core/referenceUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ComplianceModal } from './ComplianceModal';
import { ComplianceEngine } from '@/core/ComplianceEngine/ComplianceEngine';
import type { ComplianceReport } from '@/core/ComplianceEngine/types';
import { DocumentExtractor } from '@/core/DocumentExtractor';
import { FigureNode } from './FigureNode';
import { FigureModal } from './FigureModal';
import { ImageIcon } from 'lucide-react';
import type { IFigure } from '@/interfaces/IFigure';



const CustomParagraph = Paragraph.extend({
  addAttributes() {
    return {
      indent: {
        default: true,
        parseHTML: element => element.getAttribute('data-indent') !== 'false',
        renderHTML: attributes => {
          if (attributes.indent === false) {
            return { 'data-indent': 'false', class: 'no-indent', style: 'text-indent: 0px' };
          }
          return { 'data-indent': 'true' };
        },
      },
    };
  },
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Ignorar si estamos dentro de una lista, para que Tiptap maneje las viñetas correctamente
        if (this.editor.isActive('bulletList') || this.editor.isActive('orderedList') || this.editor.isActive('listItem')) {
          return false;
        }

        if (this.editor.isActive('paragraph')) {
          // Asegurar que el nuevo párrafo vuelva a tener sangría (su estado por defecto)
          return this.editor.chain().splitBlock().updateAttributes('paragraph', { indent: true }).run();
        }
        return false;
      },
    };
  },
});

const applyTitleCase = (text: string) => {
  if (!text.trim()) return text;
  const minorWords = new Set(['y', 'o', 'a', 'de', 'en', 'el', 'la', 'los', 'las', 'un', 'una', 'por', 'con', 'para', 'sin', 'del', 'al']);
  return text.split(/\s+/).map((word, index, arr) => {
    if (word.length === 0) return word;
    const lower = word.toLowerCase();
    const isFirstOrLast = index === 0 || index === arr.length - 1;

    if (isFirstOrLast || !minorWords.has(lower) || lower.length >= 4) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return lower;
  }).join(' ');
};

const AutoTitleCaseHeading = Extension.create({
  name: 'autoTitleCaseHeading',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        const { state } = editor;
        const { $from } = state.selection;

        const blockNode = $from.parent;
        if (blockNode.type.name === 'heading') {
          const start = $from.start($from.depth);
          const end = $from.end($from.depth);
          const text = state.doc.textBetween(start, end, ' ');

          if (text.trim()) {
            const titleCased = applyTitleCase(text);
            if (text !== titleCased) {
              editor.chain().deleteRange({ from: start, to: end }).insertContentAt(start, titleCased).run();
            }
          }
          // Crear un párrafo normal con sangría después del encabezado (RF-002)
          editor.chain().splitBlock().setNode('paragraph').updateAttributes('paragraph', { indent: true }).run();
          return true;
        }
        return false;
      }
    }
  }
});

const ListKeyboardShortcuts = Extension.create({
  name: 'listKeyboardShortcuts',
  addKeyboardShortcuts() {
    return {
      Tab: () => this.editor.commands.sinkListItem('listItem'),
      'Shift-Tab': () => this.editor.commands.liftListItem('listItem'),
    }
  },
});

const applyListAutoFormat = (text: string) => {
  if (!text.trim()) return text;
  let newText = text.trim();
  newText = newText.charAt(0).toUpperCase() + newText.slice(1);
  if (!newText.endsWith('.')) {
    newText += '.';
  }
  return newText;
};

const AutoFormatList = Extension.create({
  name: 'autoFormatList',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { editor } = this;
        const { state } = editor;
        const { $from } = state.selection;

        const listItem = $from.node($from.depth - 1);
        if (listItem && listItem.type.name === 'listItem') {
          const start = $from.start($from.depth);
          const end = $from.end($from.depth);
          const text = state.doc.textBetween(start, end, ' ');

          if (text.trim()) {
            const formatted = applyListAutoFormat(text);
            if (text !== formatted) {
              editor.chain().deleteRange({ from: start, to: end }).insertContentAt(start, formatted).run();
            }
          }
        }
        return false; // Allow Tiptap's default Enter handler to continue
      }
    }
  }
});

const DocumentEditor: React.FC = () => {
  const {
    documentText: text,
    setDocumentText: setText,
    setComplianceScore,
    setDocumentTitle: onTitleChange,
    isComplianceModalOpen,
    setIsComplianceModalOpen,
    haveText
  } = useDocument();
  const { references, setReferences } = useReferences();
  const { coverPage, setCoverPage, resetCoverPage } = useCoverPage();
  const { t, language } = useLanguage();
  const { citationFormat } = useCitationFormat();
  const { figures, addFigure, setFigures, setEditorInstance } = useFigures();
  const [complianceReport, setComplianceReport] = useState<ComplianceReport | null>(null);
  const [isNormalized, setIsNormalized] = useState(false);
  const [isFigureModalOpen, setIsFigureModalOpen] = useState(false);
  const [figureModalType, setFigureModalType] = useState<'figure' | 'table' | 'cuadro'>('figure');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Tooltip state
  const [hoverInfo, setHoverInfo] = useState<{ ref: IReference; x: number; y: number } | null>(null);

  // Custom dropdown state for BubbleMenu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CustomParagraph,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'justify',
      }),
      ReferenceMark,
      AutoTitleCaseHeading,
      ListKeyboardShortcuts,
      AutoFormatList,
      FigureNode,
    ],
    content: text,
    onUpdate: ({ editor }) => {
      setText(editor.getHTML());

      // Auto-renumber figures
      setTimeout(() => {
        if (editor.isDestroyed) return;
        let number = 1;
        let changed = false;
        const { tr } = editor.state;

        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'figure') {
            if (node.attrs.number !== number) {
              tr.setNodeMarkup(pos, null, { ...node.attrs, number });
              changed = true;
            }
            number++;
          }
        });

        if (changed) {
          editor.view.dispatch(tr);
        }
      }, 0);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        spellcheck: 'true',
        lang: language,
      },
    },
  });

  // Dynamic language update for spellcheck
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: 'focus:outline-none',
            spellcheck: 'true',
            lang: language,
          },
        },
      });
      // Fallback: manually update the DOM if Tiptap doesn't re-render it instantly
      editor.view.dom.setAttribute('lang', language);
    }
  }, [editor, language]);

  useEffect(() => {
    setEditorInstance(editor);
  }, [editor, setEditorInstance]);

  // Handle hover tooltips
  useEffect(() => {
    if (!editorContainerRef.current) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const refMark = target.closest('[data-reference-id]');
      if (refMark) {
        const id = refMark.getAttribute('data-reference-id');
        const reference = references.find((r) => r.id === id);
        if (reference) {
          setHoverInfo({
            ref: reference,
            x: e.clientX,
            y: e.clientY,
          });
          return;
        }
      }
      setHoverInfo(null);
    };

    const el = editorContainerRef.current;
    el.addEventListener('mousemove', handleMouseOver);
    // Remove tooltip when mouse leaves the editor container
    const handleMouseLeave = () => setHoverInfo(null);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseOver);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [references]);

  // Clean up orphaned reference marks when references are deleted from the manager
  useEffect(() => {
    if (!editor) return;

    const currentRefIds = new Set(references.map((r) => r.id));
    const { tr } = editor.state;
    let hasChanges = false;

    editor.state.doc.descendants((node, pos) => {
      if (node.marks && node.marks.length > 0) {
        node.marks.forEach((mark) => {
          if (mark.type.name === 'reference') {
            const id = mark.attrs.id;
            if (id && !currentRefIds.has(id)) {
              tr.removeMark(pos, pos + node.nodeSize, mark);
              hasChanges = true;
            }
          }
        });
      }
    });

    if (hasChanges) {
      editor.view.dispatch(tr);
    }
  }, [references, editor]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const [, setForceUpdate] = useState({});

  // Close dropdown when selection changes
  useEffect(() => {
    if (!editor) return;
    const handleSelectionUpdate = () => {
      setIsDropdownOpen(false);
      setForceUpdate({});
    };
    editor.on('selectionUpdate', handleSelectionUpdate);
    return () => {
      editor.off('selectionUpdate', handleSelectionUpdate);
    };
  }, [editor]);

  // Handle external text updates (like from localStorage on load)
  useEffect(() => {
    if (editor && !editor.isDestroyed && text && editor.getHTML() !== text) {
      if (editor.isEmpty) {
        editor.commands.setContent(text);
      }
    }
  }, [editor, text]);

  // Dynamic compliance evaluation — runs on mount and on any relevant dependency change
  useEffect(() => {
    if (!editor || !text) return;

    const timeoutId = setTimeout(() => {
      const report = ComplianceEngine.analyzeDocument({
        html: text,
        text: editor.getText(),
        isNormalized,
        hasExtractedCoverPage: coverPage.enabled,
        hasExtractedReferences: references.length > 0,
        references,
        figures
      }, citationFormat);

      setComplianceScore(report.score);
      setComplianceReport(report);
    }, 300); // Debounce 300ms to avoid locking the UI

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, citationFormat, isNormalized, editor, setComplianceScore, references, coverPage.enabled, figures]);

  // --- File handling ---

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.docx')) {
      alert(t('onlyDocxAllowed'));
      return;
    }
    setIsLoading(true);
    setIsNormalized(false);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Mammoth converts DOCX to HTML
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const rawTextResult = await mammoth.extractRawText({ arrayBuffer });

      // 2. Extract cover page, references and figures from the document structure
      const { coverPage, references: extractedRefs, figures: extractedFigures, bodyHtml } = DocumentExtractor.extract(result.value);

      if (coverPage) {
        setCoverPage(coverPage);
      } else {
        resetCoverPage();
      }

      if (extractedRefs.length > 0) {
        setReferences(extractedRefs);
      } else {
        setReferences([]);
      }

      if (extractedFigures.length > 0) {
        setFigures(extractedFigures);
      } else {
        setFigures([]);
      }

      if (editor) {
        editor.commands.setContent(bodyHtml);
        setText(editor.getHTML());
      }

      const baseName = file.name.slice(0, -5); // remove '.docx'

      // Run Compliance Engine
      const report = ComplianceEngine.analyzeDocument(
        {
          html: bodyHtml,
          text: rawTextResult.value,
          arrayBuffer,
          isNormalized: false,
          hasExtractedCoverPage: coverPage !== null,
          hasExtractedReferences: extractedRefs.length > 0,
          references: extractedRefs.length > 0 ? extractedRefs : references,
          figures: extractedFigures.length > 0 ? extractedFigures : figures,
        },
        citationFormat
      );
      setComplianceReport(report);
      setIsComplianceModalOpen(true);

      onTitleChange?.(baseName);
    } catch (error) {
      console.error('Error extracting text from Word document', error);
      alert(t('errorReadingWord'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNormalize = () => {
    setIsNormalized(true);
    if (editor) {
      const html = editor.getHTML();
      const rawText = editor.getText();
      const report = ComplianceEngine.analyzeDocument(
        {
          html,
          text: rawText,
          isNormalized: true,
          hasExtractedCoverPage: coverPage.enabled,
          hasExtractedReferences: references.length > 0,
          references,
          figures
        },
        citationFormat
      );
      setComplianceReport(report);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  const handleClear = () => {
    if (confirm(t('clearDocumentPrompt'))) {
      if (editor) {
        editor.commands.clearContent();
      }
      setText('');
      onTitleChange?.("Document_Citara");
      resetCoverPage();
      setReferences([]);
      setFigures([]);
    }
  };

  // --- Toolbar helpers ---

  type Level = 1 | 2 | 3 | 4 | 5 | 6;
  const handleHeadingToggle = (level: Level) => {
    if (!editor) return;
    const isHeading = editor.isActive('heading', { level });

    if (!isHeading) {
      const { state } = editor;
      const { $from } = state.selection;

      const start = $from.start($from.depth);
      const end = $from.end($from.depth);
      const text = state.doc.textBetween(start, end, ' ');

      if (text.trim()) {
        const titleCased = applyTitleCase(text);

        const chain = editor.chain()
          .focus()
          .deleteRange({ from: start, to: end })
          .insertContentAt(start, titleCased)
          .toggleHeading({ level });

        if (level === 1) chain.setTextAlign('center');
        chain.run();
      } else {
        const chain = editor.chain().focus().toggleHeading({ level });
        if (level === 1) chain.setTextAlign('center');
        chain.run();
      }
    } else {
      const chain = editor.chain().focus().toggleHeading({ level });
      chain.setTextAlign('justify').run();
    }
  };


  const btnBase = 'px-2 py-1 text-xs font-mono font-bold border rounded transition-colors';
  const btnIdle = 'btn-tool-idle';
  const btnActive = 'btn-tool-active';

  if (!editor) {
    return null;
  }

  // Bubble menu states
  const isActiveRefText = editor.isActive('reference');
  const isActiveFigure = editor.isActive('figure');
  const figureAttrs = isActiveFigure ? editor.getAttributes('figure') : {};
  const hasFigureRef = isActiveFigure && !!figureAttrs.referenceId;
  const isLinked = isActiveRefText || hasFigureRef;

  const handleUnlink = () => {
    if (isActiveFigure) {
      editor.chain().focus().updateAttributes('figure', { referenceId: null }).run();
    } else {
      editor.chain().focus().unsetReference().run();
    }
  };

  const handleLink = (refId: string) => {
    if (isActiveFigure) {
      editor.chain().focus().updateAttributes('figure', { referenceId: refId }).run();
    } else {
      editor.chain().focus().setReference(refId).run();
    }
    setIsDropdownOpen(false);
  };

  const renderBubbleMenuContent = () => {
    if (isLinked) {
      return (
        <>
          <span className="text-xs font-medium px-2 flex items-center gap-1" style={{ color: 'var(--text-2)' }}>
            <LinkIcon size={12} strokeWidth={1.6} />
            {t('linkedReference')}
          </span>
          <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }}></div>
          <button
            onClick={handleUnlink}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30"
            style={{ color: 'var(--err)' }}
          >
            <Unlink size={12} strokeWidth={1.6} />
            {t('removeLink')}
          </button>
        </>
      );
    }
    else {
      return (
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault(); // Keep editor focus
              setIsDropdownOpen(!isDropdownOpen);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors btn-nj ghost"
          >
            <LinkIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            {t('associateReference')}
            <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full mt-1.5 -left-2 sm:left-0 w-[280px] rounded-xl z-50 flex flex-col overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-popover)' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <BookOpen size={14} strokeWidth={1.6} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-bold tracking-wider" style={{ color: 'var(--text-2)', fontFamily: 'var(--mono-font)' }}>
                  {t('availableSources')}
                </span>
              </div>

              <div className="max-h-32 overflow-y-auto p-1.5 scrollbar-thin">
                {references.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>{t('noReferencesCreated')}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{t('addSourcesFromPanel')}</p>
                  </div>
                ) : (
                  references.map((ref) => (
                    <button
                      key={ref.id}
                      onMouseDown={(e) => { e.preventDefault(); handleLink(ref.id); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-all flex flex-col gap-1"
                      style={{ border: '1px solid transparent' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-soft)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                    >
                      <span className="text-sm font-semibold line-clamp-1" style={{ color: 'var(--text)' }}>
                        {ref.author || t('noAuthor')} ({getYear(ref.year, language)})
                      </span>
                      <span className="text-xs line-clamp-2 leading-snug" style={{ color: 'var(--text-2)' }}>
                        {ref.title || t('noTitle')}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-full flex-1 min-h-0 relative" ref={editorContainerRef}>
      {/* Tooltip Quick View */}
      {hoverInfo && (
        <div
          className="fixed z-50 p-3 rounded-lg max-w-sm pointer-events-none transform -translate-x-1/2 translate-y-4"
          style={{ top: hoverInfo.y, left: hoverInfo.x, background: 'var(--surface-3)', border: '1px solid var(--border)', boxShadow: '0 8px 24px -6px rgba(0,0,0,.5)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--accent)', fontFamily: 'var(--mono-font)' }}>
            {t('associatedSource')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text)', fontFamily: 'var(--doc-font)' }}>
            {getReferenceText(hoverInfo.ref, language)}
          </p>
        </div>
      )}

      {/* Bubble Menu for IReference Association */}
      <BubbleMenu
        editor={editor}
        shouldShow={({ editor, state }) => {
          if (!haveText || !editor.isFocused) return false;
          if (editor.isActive('figure')) return true;
          return !state.selection.empty && !editor.isActive('image');
        }}
        className="flex rounded-md p-1 gap-1 items-center z-40" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 12px -4px rgba(0,0,0,.4)' }}
      >
        {renderBubbleMenuContent()}
      </BubbleMenu>

      {/* Upload row */}
      <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer btn-nj sm">
            <Upload size={14} strokeWidth={1.8} />
            {isLoading ? t('loading') : t('uploadDocx')}
          </label>
          <span className="text-sm" style={{ color: 'var(--text-3)' }}>
            {t('orDragDrop')}
          </span>
        </div>

        {editor.getText().trim() && (
          <button onClick={handleClear} className="btn-nj sm" style={{ color: 'var(--err)', borderColor: 'var(--err)' }}>
            <Trash2 size={13} strokeWidth={1.6} />
            {t('clearDocument')}
          </button>
        )}
      </div>


      {/* Format toolbar */}
      <div className="sticky top-16 z-40 bg-[var(--surface)] shadow-md border-b border-[var(--border)] p-1.5 flex flex-wrap items-center gap-1 mb-2 rounded-t-md">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`${btnBase} ${editor.isActive('bold') ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('bold')}
              title="Negrita (Ctrl+B)"
            >
              <Bold size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Negrita (Ctrl+B)</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`${btnBase} ${editor.isActive('italic') ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('italic')}
              title="Cursiva (Ctrl+I)"
            >
              <Italic size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Cursiva (Ctrl+I)</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`${btnBase} ${editor.isActive('underline') ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('underline')}
              title="Subrayado (Ctrl+U)"
            >
              <UnderlineIcon size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Subrayado (Ctrl+U)</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().unsetBold().unsetItalic().unsetUnderline().run()}
              className={`${btnBase} ${btnIdle}`}
              title="Limpiar Formato"
            >
              <Eraser size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Limpiar Formato</p></TooltipContent>
        </Tooltip>

        <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`${btnBase} ${editor.isActive('bulletList') ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('bulletList')}
              title="Lista de Viñetas"
            >
              <List size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Lista de Viñetas</p></TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`${btnBase} ${editor.isActive('orderedList') ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('orderedList')}
              title="Lista Numerada"
            >
              <ListOrdered size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Lista Numerada</p></TooltipContent>
        </Tooltip>

        <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>

        {/* RF-001: Deshabilitar alineación cuando el cursor está en un encabezado */}
        {(() => {
          const isHeading = editor.isActive('heading'); return (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={isHeading}
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`${btnBase} ${isHeading ? 'opacity-50 cursor-not-allowed' : ''} ${editor.isActive({ textAlign: 'left' }) ? btnActive : btnIdle}`}
                    aria-pressed={editor.isActive({ textAlign: 'left' })}
                    title="Alinear a la Izquierda"
                  >
                    <AlignLeft size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Alinear a la Izquierda</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={isHeading}
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`${btnBase} ${isHeading ? 'opacity-50 cursor-not-allowed' : ''} ${editor.isActive({ textAlign: 'center' }) ? btnActive : btnIdle}`}
                    aria-pressed={editor.isActive({ textAlign: 'center' })}
                    title="Centrar"
                  >
                    <AlignCenter size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Centrar</p></TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    disabled={isHeading}
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`${btnBase} ${isHeading ? 'opacity-50 cursor-not-allowed' : ''} ${editor.isActive({ textAlign: 'right' }) ? btnActive : btnIdle}`}
                    aria-pressed={editor.isActive({ textAlign: 'right' })}
                    title="Alinear a la Derecha"
                  >
                    <AlignRight size={15} />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Alinear a la Derecha</p></TooltipContent>
              </Tooltip>
            </>
          )
        })()}

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled={!editor.isActive('paragraph') || editor.isActive('listItem')}
              onClick={() => {
                if (!editor.isActive('paragraph') || editor.isActive('listItem')) return;
                const isCurrentlyDisabled = editor.isActive('paragraph', { indent: false });
                editor.chain().focus().updateAttributes('paragraph', { indent: isCurrentlyDisabled }).run();
              }}
              className={`${btnBase} ${(!editor.isActive('paragraph') || editor.isActive('listItem')) ? 'opacity-50 cursor-not-allowed' : ''} ${(editor.isActive('paragraph') && !editor.isActive('listItem') && !editor.isActive('paragraph', { indent: false })) ? btnActive : btnIdle}`}
              aria-pressed={editor.isActive('paragraph') && !editor.isActive('listItem') && !editor.isActive('paragraph', { indent: false })}
              title="Sangría automática"
            >
              <Indent size={15} />
            </button>
          </TooltipTrigger>
          <TooltipContent><p>Sangría automática</p></TooltipContent>
        </Tooltip>

        <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleHeadingToggle(1)}
              className={`${btnBase} ${editor.isActive('heading', { level: 1 }) ? btnActive : btnIdle}`}
            >
              H1
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('heading1')}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleHeadingToggle(2)}
              className={`${btnBase} ${editor.isActive('heading', { level: 2 }) ? btnActive : btnIdle}`}
            >
              H2
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('heading2')}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleHeadingToggle(3)}
              className={`${btnBase} ${editor.isActive('heading', { level: 3 }) ? btnActive : btnIdle}`}
            >
              H3
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('heading3')}</p>
          </TooltipContent>
        </Tooltip>
        <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => editor.chain().focus().setParagraph().setTextAlign('justify').run()}
              className={`${btnBase} ${editor.isActive('paragraph') ? btnActive : btnIdle}`}
            >
              ¶
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('paragraph')}</p>
          </TooltipContent>
        </Tooltip>

        <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { setFigureModalType('figure'); setIsFigureModalOpen(true); }}
              className={`${btnBase} ${btnIdle}`}
            >
              <ImageIcon size={14} className="inline mr-1" />
              {t('insertFigure')}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('insertFigure')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => { setFigureModalType('table'); setIsFigureModalOpen(true); }}
              className={`${btnBase} ${btnIdle}`}
            >
              <ImageIcon size={14} className="inline mr-1" />
              Insertar Tabla
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insertar Tabla</p>
          </TooltipContent>
        </Tooltip>

        {citationFormat === 'upel' && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => { setFigureModalType('cuadro'); setIsFigureModalOpen(true); }}
                className={`${btnBase} ${btnIdle}`}
              >
                <ImageIcon size={14} className="inline mr-1" />
                Insertar Cuadro
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insertar Cuadro</p>
            </TooltipContent>
          </Tooltip>
        )}

        {citationFormat === 'upel' && (
          <>
            <span className="select-none px-0.5" style={{ color: 'var(--border)' }}>|</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    if (confirm('¿Deseas cargar la plantilla UPEL? Esto reemplazará el contenido actual.')) {
                      editor.commands.setContent(`
                          <h1 style="text-align: center;">ÍNDICE GENERAL</h1>
                          <p>[El índice se generará automáticamente]</p>
                          <h1 style="text-align: center;">RESUMEN</h1>
                          <p>Contenido del resumen...</p>
                          <h1 style="text-align: center;">INTRODUCCIÓN</h1>
                          <p>Contenido de la introducción...</p>
                          <h1 style="text-align: center;">CAPÍTULO I<br>EL PROBLEMA</h1>
                          <h2>Planteamiento del Problema</h2>
                          <p>Descripción del contexto y planteamiento...</p>
                          <h3>Objetivos de la Investigación</h3>
                          <p>Objetivo general y específicos...</p>
                        `);
                    }
                  }}
                  className={`${btnBase} btn-nj accent`}
                >
                  <BookOpen size={14} className="inline mr-1" />
                  Cargar Plantilla UPEL
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Inyecta la estructura sugerida para un documento UPEL</p>
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>


      {/* Estilos de listas — inyectados con alta especificidad para sobrescribir el reset de Tailwind */}
      <style>{`
        div.tiptap.ProseMirror ul,
        div.tiptap.ProseMirror ol {
          list-style: none !important;
          margin: 0 0 1em 2rem !important;
          padding: 0 !important;
        }
        div.tiptap.ProseMirror li {
          display: flex !important;
          align-items: baseline !important;
          margin-bottom: 0.4em !important;
          text-indent: 0 !important;
        }
        div.tiptap.ProseMirror ul > li::before {
          content: "•" !important;
          flex-shrink: 0 !important;
          min-width: 1.4rem !important;
          font-size: 1.2em !important;
          line-height: 2 !important;
          color: currentColor !important;
        }
        div.tiptap.ProseMirror ol {
          counter-reset: tiptap-list-counter !important;
        }
        div.tiptap.ProseMirror ol > li {
          counter-increment: tiptap-list-counter !important;
        }
        div.tiptap.ProseMirror ol > li::before {
          content: counter(tiptap-list-counter) "." !important;
          flex-shrink: 0 !important;
          min-width: 1.6rem !important;
          font-size: 0.95em !important;
          line-height: 2 !important;
          color: currentColor !important;
        }
        div.tiptap.ProseMirror li > p {
          flex: 1 !important;
          text-indent: 0 !important;
          margin-bottom: 0 !important;
        }
      `}</style>

      {/* Editor area */}
      <div
        className={`relative flex-1 w-full overflow-y-auto min-h-0 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-[color:var(--accent)] focus-within:outline-none transition-shadow duration-150 ${isNormalized ? (citationFormat === 'upel' ? 'upel-normalized-doc' : 'apa-normalized-doc') : ''}`}
        style={{ background: 'var(--surface)', border: `1px solid ${isDragging ? 'var(--accent)' : 'var(--border)'}` }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md pointer-events-none" style={{ background: 'var(--accent-soft)' }}>
            <p className="font-medium text-sm" style={{ color: 'var(--accent)' }}>
              {t('dropDocxHere')}
            </p>
          </div>
        )}
        <EditorContent
          editor={editor}
          className="min-h-full rounded-md outline-none"
          style={{ background: 'var(--paper)', color: 'var(--paper-ink, var(--text))' }}
        />
      </div>
      {isNormalized && (
        <div className="mb-2 px-3 py-2 bg-green-900/30 border border-green-800/50 rounded-md text-sm text-green-300 flex items-center gap-2">
          Documento normalizado automáticamente según reglas de {citationFormat === 'apa7' ? 'APA 7' : citationFormat === 'apa6' ? 'APA 6' : 'IEEE'}.
        </div>
      )}

      <ComplianceModal
        report={complianceReport}
        isOpen={isComplianceModalOpen}
        onClose={() => setIsComplianceModalOpen(false)}
        onNormalize={handleNormalize}
      />

      <FigureModal
        isOpen={isFigureModalOpen}
        onClose={() => setIsFigureModalOpen(false)}
        figureType={figureModalType}
        onSave={(figureData) => {
          const newFigure: IFigure = {
            ...figureData,
            id: crypto.randomUUID(),
            number: figures.length + 1,
          };
          addFigure(newFigure);

          // Insert figure node
          if (editor) {
            editor.chain().focus().insertContent({
              type: 'figure',
              attrs: {
                id: newFigure.id,
                number: newFigure.number,
                imageUrl: newFigure.imageUrl,
                title: newFigure.title,
                caption: newFigure.caption,
                note: newFigure.note,
                attributionType: newFigure.copyrightAttribution?.type,
                attributionTitle: newFigure.copyrightAttribution?.title,
                attributionAuthor: newFigure.copyrightAttribution?.author,
                attributionYear: newFigure.copyrightAttribution?.year,
                attributionPublisher: newFigure.copyrightAttribution?.publisher,
                attributionJournal: newFigure.copyrightAttribution?.journal,
                attributionSiteName: newFigure.copyrightAttribution?.siteName,
                attributionChannel: newFigure.copyrightAttribution?.channel,
                attributionUrl: newFigure.copyrightAttribution?.url,
                attributionLicense: newFigure.copyrightAttribution?.license,
              }
            }).run();
          }
        }}
      />
    </div>
  );
};

export default DocumentEditor;
