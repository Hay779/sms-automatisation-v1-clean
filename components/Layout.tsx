
import React, { useState } from 'react';
import { LayoutDashboard, Settings as SettingsIcon, LogOut, Smartphone, HelpCircle, ArrowLeft, Menu, X, FileText } from 'lucide-react';
import { Settings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: 'dashboard' | 'settings' | 'form_submissions';
  onChangeView: (view: 'dashboard' | 'settings' | 'form_submissions') => void;
  settings: Settings | null;
  onLogout: () => void;
  showTutorial: boolean;
  onToggleTutorial: () => void;
  isImpersonating?: boolean;
  onExitImpersonation?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  settings, 
  onLogout,
  showTutorial,
  onToggleTutorial,
  isImpersonating,
  onExitImpersonation
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isSystemActive = settings?.auto_sms_enabled;

  const NavItem = ({ view, label, icon: Icon }: { view: 'dashboard' | 'settings' | 'form_submissions', label: string, icon: any }) => (
    <button
      onClick={() => {
          onChangeView(view);
          setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        currentView === view
          ? isImpersonating ? 'bg-indigo-600 text-white shadow-md' : 'bg-blue-600 text-white shadow-md'
          : 'text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-50 relative">
          <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <span className="font-bold uppercase tracking-tight">{settings?.company_name || 'SMS AUTO v1'}</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col h-screen 
        ${isImpersonating ? 'bg-indigo-900' : 'bg-slate-900'} text-white
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Impersonation Banner in Sidebar */}
        {isImpersonating && (
          <div className="bg-indigo-800 p-2 text-center text-xs font-medium text-indigo-200">
            MODE ADMINISTRATION
          </div>
        )}

        <div className="p-6 border-b border-white/10 hidden md:flex items-center space-x-3">
          <div className={`p-2 rounded-lg flex-shrink-0 shadow-lg ${isImpersonating ? 'bg-indigo-600' : 'bg-blue-600'}`}>
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight truncate uppercase tracking-tight">
              {settings?.company_name || 'SMS AUTO v1'}
            </h1>
            <p className="text-xs text-slate-400 truncate font-medium">
              {settings?.company_tagline || 'Dashboard Manager'}
            </p>
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 mt-14 md:mt-0">
          {isImpersonating && onExitImpersonation && (
             <button
             onClick={onExitImpersonation}
             className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all mb-4 border border-white/10"
           >
             <ArrowLeft className="w-5 h-5" />
             <span className="font-medium">Retour Admin</span>
           </button>
          )}

          <NavItem view="dashboard" label="Tableau de bord" icon={LayoutDashboard} />
          <NavItem view="form_submissions" label="Formulaires & CRM" icon={FileText} />
          <NavItem view="settings" label="Paramètres" icon={SettingsIcon} />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        
        {/* Impersonation Top Bar */}
        {isImpersonating && (
          <div className="bg-indigo-600 text-white px-6 py-2 text-sm flex justify-between items-center shadow-inner">
             <span>Vous consultez le compte de <strong>{settings?.company_name}</strong> en tant qu'administrateur.</span>
             <button onClick={onExitImpersonation} className="underline hover:text-indigo-200">Quitter</button>
          </div>
        )}

        <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-4 md:gap-0">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {currentView === 'dashboard' ? 'Supervision' : currentView === 'settings' ? 'Configuration Système' : 'Boîte de Réception'}
          </h2>
          
          <div className="flex items-center space-x-4">
            {/* Help Button */}
            <button 
              onClick={onToggleTutorial}
              className={`p-2 rounded-full transition-colors ${showTutorial ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}
              title="Activer/Désactiver l'aide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Status Badge */}
            <div className={`flex items-center space-x-3 px-3 py-1.5 rounded-full border transition-colors ${
              isSystemActive 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSystemActive ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isSystemActive ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
              <span className={`text-xs font-semibold uppercase tracking-wide ${
                isSystemActive ? 'text-emerald-700' : 'text-amber-700'
              }`}>
                {isSystemActive ? 'Système Opérationnel' : 'Système en Pause'}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto pb-20 relative">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};
