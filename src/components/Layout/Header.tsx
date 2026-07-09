import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { FormatSelector } from './FormatSelector';
import { LanguageToggle } from './LanguageToggle';
import { ExportButton } from './ExportButton';
import { HeaderBrand } from './HeaderBrand';
import { useDocument } from '@/context/DocumentContext';
import { useCitationFormat } from '@/context/AppContext';
import { FORMAT_CONFIGS } from '@/utils/citationFormats';
import { useAuth } from '@/context/AuthContext';
import { Login } from '../Auth/Login';
import { Register } from '../Auth/Register';
import { UserProfile } from '../Auth/UserProfile';

const Header: React.FC = () => {
  const { haveText, complianceScore, setIsComplianceModalOpen } = useDocument();
  const { citationFormat } = useCitationFormat();
  const { user } = useAuth();
  const [modalType, setModalType] = React.useState<'login' | 'register' | 'profile' | null>(null);
  
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50" style={{ background: 'var(--bg)', borderBottomColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap gap-4 justify-between items-center">
        {/* ── Brand ── */}
        <div className="flex items-center gap-6">
          <HeaderBrand />
        </div>

        {/* ── Actions ── */}
        <div className="flex items-center">
          {/* Herramientas */}
          <div className="flex items-center space-x-3">
            {(complianceScore !== null && haveText) && (
              <div 
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full shadow-sm animate-in fade-in duration-300 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
                onClick={() => setIsComplianceModalOpen(true)}
                title="Ver reporte de cumplimiento"
              >
                {/* Circular Progress */}
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path 
                      strokeWidth="4.5" 
                      stroke="var(--surface-2)" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                    <path 
                      strokeDasharray={`${complianceScore}, 100`} 
                      strokeWidth="4.5" 
                      strokeLinecap="round" 
                      stroke="var(--accent)" 
                      fill="none" 
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    />
                  </svg>
                </div>
                <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text)' }}>
                  {complianceScore}%
                </span>
                <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
                  {FORMAT_CONFIGS[citationFormat]?.label || 'APA'}
                </span>
              </div>
            )}
            <FormatSelector />
            <LanguageToggle />
            <ThemeToggle />
            <ExportButton />
          </div>

          {/* Separador */}
          <div className="w-px h-6 mx-4" style={{ background: 'var(--border)' }} />

          {/* Opciones de Cuenta */}
          <div className="flex items-center space-x-2">
            {user ? (
              <button 
                onClick={() => setModalType('profile')}
                className="px-3 py-1.5 text-sm font-medium rounded-md hover:opacity-80 transition-opacity flex items-center gap-2"
                style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              >
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                Perfil
              </button>
            ) : (
              <>
                <button 
                  onClick={() => setModalType('login')}
                  className="px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ color: 'var(--text)' }}
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={() => setModalType('register')}
                  className="px-3 py-1.5 text-sm font-medium rounded-md transition-opacity"
                  style={{ background: 'var(--accent)', color: 'var(--bg)' }}
                >
                  Crear Cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modals Overlay */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            className="relative w-full max-w-md mx-4 p-6 rounded-xl shadow-2xl" 
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <button 
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold"
            >
              ✕
            </button>
            {modalType === 'login' && <Login />}
            {modalType === 'register' && <Register />}
            {modalType === 'profile' && <UserProfile onClose={() => setModalType(null)} />}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
