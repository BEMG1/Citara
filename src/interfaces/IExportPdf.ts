export interface IExportPDF {
  showExportPdfWarning: boolean;
  setShowExportPdfWarning: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportPdfClick: () => void;
  handleExportPdfAnyway: () => Promise<void>;
  isExportingPdf: boolean;
}