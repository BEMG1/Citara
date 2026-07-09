import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useExportWord, useDocument, useLanguage, useExportPDF } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { checkRateLimit, updateRateLimit } from '@/utils/rateLimit';
import toast from 'react-hot-toast';
import { ExportModal } from './ExportModal';

export const ExportButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { handleExportClick } = useExportWord();
  const { handleExportPdfClick, isExportingPdf } = useExportPDF();
  const { haveText } = useDocument();
  const { t } = useLanguage();
  const { user, profile } = useAuth();

  const handleOpenExport = async () => {    
    const { allowed, remainingMinutes } = await checkRateLimit(user?.id, profile?.userType);
    
    if (!allowed) {
      if (!user) {
        toast.error(`Actualmente no estas logueado, y deberas esperar ${remainingMinutes} minutos, si quieres disminuir el tiempo incia sesión o crea una cuenta`, { duration: 5000 });
      } else {
        toast.error(`Actualmente no puede generar debido al límite de la capa gratuita. Espera ${remainingMinutes} minutos.`, { duration: 5000 });
      }
      return;
    }
    
    setIsModalOpen(true);
  };

  const handleDocxExport = async () => {
    try {
      await handleExportClick();
      updateRateLimit(user?.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePdfExport = async () => {
    try {
      await handleExportPdfClick();
      updateRateLimit(user?.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenExport}
        disabled={!haveText || isExportingPdf}
        className="btn-nj primary"
      >
        <Download size={14} strokeWidth={1.8} />
        {isExportingPdf ? t('loading') : t('exportBtn')}
      </button>

      <ExportModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExportDocx={handleDocxExport}
        onExportPdf={handlePdfExport}
      />
    </>
  );
};
