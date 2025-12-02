
import React, { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Settings as SettingsView } from './components/Settings';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { PublicForm } from './components/PublicForm';
import { FormSubmissions } from './components/FormSubmissions';
import { LandingPage } from './components/LandingPage';
// Using secure enhanced API service
import { SecureApiService as ApiService } from './services/secureSupabaseApi';
import { Settings, SmsLog, DashboardStats, UserRole } from './types';
import { Loader2 } from 'lucide-react';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_ROLE_KEY = 'auth_role';
const COMPANY_ID_KEY = 'auth_company_id';

const App: React.FC = () => {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('CLIENT');
  const [isImpersonating, setIsImpersonating] = useState(false);
  
  // App state
  const [currentView, setCurrentView] = useState<'dashboard' | 'settings' | 'form_submissions'>('dashboard');
  const [isPublicFormMode, setIsPublicFormMode] = useState(false);
  
  // Navigation State
  const [viewState, setViewState] = useState<'landing' | 'login' | 'register' | 'app'>('landing');

  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ sms_sent: 0, calls_filtered: 0, errors: 0 });
  const [currentCompanyId, setCurrentCompanyId] = useState<string>('');

  // Tutorial State
  const [showTutorial, setShowTutorial] = useState(false);

  const fetchData = async (compId: string) => {
    try {
      const [fetchedSettings, fetchedLogs, fetchedStats] = await Promise.all([
        ApiService.getSettings(compId),
        ApiService.getLogs(compId),
        ApiService.getStats(compId)
      ]);
      setSettings(fetchedSettings);
      setLogs(fetchedLogs);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check auth on load
    const storedAuth = localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
    const storedRole = localStorage.getItem(AUTH_ROLE_KEY) || sessionStorage.getItem(AUTH_ROLE_KEY);
    const storedCompId = localStorage.getItem(COMPANY_ID_KEY) || sessionStorage.getItem(COMPANY_ID_KEY);
    
    if (storedAuth) {
      setIsAuthenticated(true);
      setViewState('app');
      if (storedRole) setUserRole(storedRole as UserRole);
      
      if (storedRole === 'CLIENT' && storedCompId) {
        setCurrentCompanyId(storedCompId);
        fetchData(storedCompId);
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const onLoginSuccess = (role: UserRole, rememberMe: boolean, companyId?: string) => {
    setIsAuthenticated(true);
    setViewState('app');
    setUserRole(role);
    
    const token = 'session_' + Date.now();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
    storage.setItem(AUTH_ROLE_KEY, role);

    if (role === 'CLIENT' && companyId) {
        setCurrentCompanyId(companyId);
        storage.setItem(COMPANY_ID_KEY, companyId);
        fetchData(companyId);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsImpersonating(false);
    localStorage.clear();
    sessionStorage.clear();
    setCurrentView('dashboard');
    setShowTutorial(false);
    setIsPublicFormMode(false);
    setViewState('landing');
  };

  // SUPER ADMIN ACTIONS
  const handleImpersonate = async (companyId: string) => {
    setIsLoading(true);
    // In production, ApiService is stateless, we just switch context ID locally
    setCurrentCompanyId(companyId);
    setIsImpersonating(true);
    await fetchData(companyId);
  };

  const handleExitImpersonation = async () => {
    setIsLoading(true);
    setIsImpersonating(false);
    setSettings(null);
    setIsLoading(false);
  };

  // CLIENT ACTIONS
  const handleSaveSettings = async (newSettings: Settings) => {
    if (!currentCompanyId) return;
    const updated = await ApiService.updateSettings(currentCompanyId, newSettings);
    setSettings(updated);
  };

  const handleToggleStatus = async () => {
    if (!settings) return;
    const newSettings = { ...settings, auto_sms_enabled: !settings.auto_sms_enabled };
    const updated = await ApiService.updateSettings(newSettings);
    setSettings(updated);
  };

  const handleSimulateCall = async () => {
    alert("En mode Production, la simulation se fait via l'URL Webhook (voir onglet Système).");
  };

  // RENDER LOADING
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <h2 className="text-slate-600 font-medium">Connexion sécurisée...</h2>
        </div>
      </div>
    );
  }

  // PUBLIC FORM VIEW (SIMULATOR)
  if (isPublicFormMode && settings) {
      return (
          <PublicForm 
            settings={settings} 
            companyId={currentCompanyId} 
            onClose={() => setIsPublicFormMode(false)} 
          />
      );
  }

  // NAVIGATION FLOW
  if (!isAuthenticated) {
      switch (viewState) {
          case 'login':
              return <Login onLoginSuccess={onLoginSuccess} onRegisterClick={() => setViewState('register')} />;
          case 'register':
              return <Register onRegisterSuccess={onLoginSuccess} onBackToLogin={() => setViewState('login')} />;
          case 'landing':
          default:
              return <LandingPage onLoginClick={() => setViewState('login')} onRegisterClick={() => setViewState('register')} />;
      }
  }

  // APP LOGIC (Authenticated)
  
  if (userRole === 'SUPER_ADMIN' && !isImpersonating) {
    return <SuperAdminDashboard onImpersonate={handleImpersonate} onLogout={handleLogout} />;
  }

  const renderContent = () => {
      if (!settings) {
          return (
              <div className="flex flex-col items-center justify-center h-96 text-center px-4">
                  <div className="bg-rose-50 p-4 rounded-full mb-4">
                      <Loader2 className="w-8 h-8 text-rose-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Configuration requise</h3>
                  <p className="text-slate-500 mb-6">La base de données semble vide ou inaccessible.<br/>Vérifiez vos clés Supabase dans Vercel.</p>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                      Réessayer
                  </button>
              </div>
          );
      }

      switch (currentView) {
          case 'dashboard':
              return (
                <Dashboard 
                    stats={stats} 
                    logs={logs} 
                    settings={settings} 
                    onToggleStatus={handleToggleStatus} 
                    onSimulateCall={handleSimulateCall}
                    showTutorial={showTutorial}
                />
              );
          case 'settings':
              return <SettingsView settings={settings} onSave={handleSaveSettings} />;
          case 'form_submissions':
              return <FormSubmissions onOpenSimulator={() => setIsPublicFormMode(true)} />;
          default:
              return null;
      }
  };

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={setCurrentView} 
      settings={settings}
      onLogout={handleLogout}
      showTutorial={showTutorial}
      onToggleTutorial={() => setShowTutorial(!showTutorial)}
      isImpersonating={isImpersonating}
      onExitImpersonation={isImpersonating ? handleExitImpersonation : undefined}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
