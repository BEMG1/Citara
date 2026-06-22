import { useDocument } from "@/context/DocumentContext";
import { useCitationFormat } from "@/context/CitationFormatContext";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/context/LanguageContext";
import { extractHeadings } from "@/utils/tocUtils";
import { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PageSettings() {
  const {
    pageNumberPosition,
    setPageNumberPosition,
    startNumberingOnCover,
    setStartNumberingOnCover,
    generateTOC,
    setGenerateTOC,
    documentText,
  } = useDocument();

  const { citationFormat } = useCitationFormat();
  const { t } = useLanguage();

  const defaultPositionForFormat = citationFormat === "ieee" ? "bottom-center" : "top-right";
  const currentPosition = pageNumberPosition || defaultPositionForFormat;

  const headings = useMemo(() => extractHeadings(documentText), [documentText]);
  const hasHeadings = headings.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-bold" style={{ color: "var(--text)" }}>
        {t('pageSettingsTitle')}
      </h3>

      <Accordion type="multiple" defaultValue={["numeracion"]} className="w-full" style={{ color: "var(--text)" }}>
        <AccordionItem value="numeracion" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            {t('pageNumbering')}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-6 pt-2 pb-4">
            {/* Page Number Position */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold" style={{ color: "var(--text-2)" }}>
                {t('pageNumberPosition')}
              </label>
              <select
                value={currentPosition}
                onChange={(e) => setPageNumberPosition(e.target.value as any)}
                className="p-2 rounded-md text-sm border focus:outline-none focus:ring-2 transition-colors duration-200"
                style={{
                  background: "var(--surface-2)",
                  borderColor: "var(--border)",
                  color: "var(--text)",
                }}
              >
                <option value="top-right">{t('posTopRight')}</option>
                <option value="top-center">{t('posTopCenter')}</option>
                <option value="top-left">{t('posTopLeft')}</option>
                <option value="bottom-right">{t('posBottomRight')}</option>
                <option value="bottom-center">{t('posBottomCenter')}</option>
                <option value="bottom-left">{t('posBottomLeft')}</option>
              </select>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>
                {(t('pageNumberDefaultFormat') as string).replace('{0}', citationFormat.toUpperCase())}
              </p>
            </div>

            {/* Start on Cover Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-200" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <div className="flex flex-col gap-1 pr-4">
                <label className="text-sm font-semibold cursor-pointer" style={{ color: "var(--text)" }} htmlFor="start-cover">
                  {t('startNumberOnCover')}
                </label>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {t('startNumberOnCoverDesc')}
                </p>
              </div>
              <Switch
                id="start-cover"
                checked={startNumberingOnCover}
                onCheckedChange={setStartNumberingOnCover}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* ── Tabla de Contenido ───────────────────────────────────────────── */}
        <AccordionItem value="toc" style={{ borderColor: "var(--border)" }}>
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            {t('tocSection')}
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-2 pb-4">
            {/* TOC Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border transition-colors duration-200" style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <div className="flex flex-col gap-1 pr-4">
                <label className="text-sm font-semibold cursor-pointer" style={{ color: "var(--text)" }} htmlFor="generate-toc">
                  {t('tocToggle')}
                </label>
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  {t('tocToggleDesc')}
                </p>
              </div>
              <Switch
                id="generate-toc"
                checked={generateTOC}
                onCheckedChange={setGenerateTOC}
              />
            </div>

            {/* Warning: no headings found */}
            {generateTOC && !hasHeadings && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border text-xs"
                style={{
                  borderColor: "var(--warn)",
                  background: "rgba(217, 119, 6, 0.08)",
                  color: "var(--warn)",
                }}
              >
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>{t('tocNoHeadings')}</span>
              </div>
            )}

            {/* Info: headings found */}
            {generateTOC && hasHeadings && (
              <div
                className="flex items-start gap-2 p-3 rounded-lg border text-xs"
                style={{
                  borderColor: "var(--ok)",
                  background: "rgba(5, 150, 105, 0.08)",
                  color: "var(--ok)",
                }}
              >
                <span className="mt-0.5 shrink-0">✓</span>
                <span>
                  {headings.length}{' '}
                  {headings.length === 1 ? 'encabezado encontrado' : 'encabezados encontrados'}.
                </span>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
