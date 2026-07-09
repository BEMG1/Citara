import AppProviders from "@/context/AppContext";
import Header from "@/components/Layout/Header";
import DocumentEditor from "@/components/DocumentEditor/DocumentEditor";
import DocumentTitle from "@/components/DocumentEditor/DocumentTitle";
import ReferencesManager from "@/components/References/ReferencesManager";
import ExportWarningModal from "@/components/DocumentEditor/ExportWarningModal";
import CoverPageForm from "@/components/CoverPage/CoverPageForm";
import { BookOpen, FileImage } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupportWidget } from "@/components/Support/SupportWidget";
import { useLanguage } from "@/context/AppContext";
import { useCoverPage } from "@/context/AppContext";


// ─── Right panel with tabs ─────────────────────────────────────────────────────

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PageSettings from "@/components/Settings/PageSettings";
import { Settings, ImageIcon } from "lucide-react";
import FigurePropertiesPanel from "@/components/Figures/FigurePropertiesPanel";
import { useFigures } from "@/context/AppContext";

function RightPanel() {
  const { coverPage } = useCoverPage();
  const { figures } = useFigures();
  const { t } = useLanguage();

  return (
    <div
      className="rounded-lg flex-1 flex flex-col min-h-0"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <Tabs defaultValue="cover" className="flex-1 flex flex-col min-h-0">
        {/* Tab bar */}
        <div
          className="flex px-2 pt-2 gap-1"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <TabsList className="bg-transparent p-0 h-auto gap-1">
            <TabsTrigger
              value="cover"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
              style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
            >
              <FileImage className="h-4 w-4" strokeWidth={1.6} />
              {t("coverPageTab")}
              {coverPage.enabled && (
                <span
                  className="ml-1 inline-flex items-center justify-center h-4 min-w-4 px-1 text-[10px] font-bold rounded-full leading-none"
                  style={{ background: "var(--accent)", color: "var(--bg)" }}
                >
                  ✓
                </span>
              )}
            </TabsTrigger>

            <TabsTrigger
              value="references"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
              style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.6} />
              {t("referencesHeading")}
            </TabsTrigger>

            {figures.length > 0 && (
              <TabsTrigger
                value="figures"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
                style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
              >
                <ImageIcon className="h-4 w-4" strokeWidth={1.6} />
                {t("figuresTab")}
              </TabsTrigger>
            )}
            
            <TabsTrigger
              value="settings"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-none rounded-t-md border-b-2 border-transparent data-[state=active]:border-[color:var(--accent)] data-[state=active]:text-[color:var(--accent)] data-[state=active]:bg-[color:var(--accent-soft)] data-[state=inactive]:text-[color:var(--text-2)] hover:data-[state=inactive]:text-[color:var(--text)] hover:data-[state=inactive]:bg-[color:var(--surface-3)] transition-all duration-150 data-[state=active]:shadow-none"
              style={{ fontFamily: "var(--ui-font)", marginBottom: "-1px" }}
            >
              <Settings className="h-4 w-4" strokeWidth={1.6} />
              {t("titleSettingsTab")}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 min-h-0">
          <TabsContent value="cover" className="m-0 h-full anim-fade-in outline-none">
            <CoverPageForm />
          </TabsContent>
          <TabsContent value="references" className="m-0 h-full anim-fade-in outline-none">
            <ReferencesManager />
          </TabsContent>
          <TabsContent value="settings" className="m-0 h-full anim-fade-in outline-none">
            <PageSettings />
          </TabsContent>
          <TabsContent value="figures" className="m-0 h-full anim-fade-in outline-none">
            <FigurePropertiesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

import { Toaster } from "react-hot-toast";

// ─── App content ───────────────────────────────────────────────────────────────

function AppContent() {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--surface-2)',
            color: 'var(--text)',
            border: '1px solid var(--border)'
          }
        }} 
      />
      <ExportWarningModal />
      <Header />
      <SupportWidget />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 min-h-0">
        <div className="w-full lg:w-3/5 flex flex-col gap-4 min-h-0 h-[calc(100vh-14rem)] min-h-[1100px]">
          <div
            className="p-6 rounded-lg flex-1 flex flex-col min-h-0"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <DocumentTitle />
            <DocumentEditor />
          </div>
        </div>

        {/* Right column — Tabbed panel (References | Cover Page) */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 anim-fade-in anim-delay-1 min-h-0 h-[calc(100vh-14rem)] min-h-[1100px]">
          <RightPanel />
        </div>
      </main>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

function App() {
  return (
    <AppProviders>
      <TooltipProvider delayDuration={300}>
        <AppContent />
      </TooltipProvider>
    </AppProviders>
  );
}

export default App;
