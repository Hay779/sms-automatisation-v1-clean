import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/supabaseApi';
import { CompanyStats, SystemConfig, SmsProvider, Company, CreditTransaction } from '../types';
import { Users, Activity, AlertTriangle, LogIn, Trash2, Plus, Search, Server, Key, Globe, Save, Copy, ExternalLink, HelpCircle, Database, Coins, X, Smartphone, FileText, CheckCircle, RefreshCw, Briefcase, Lock, ClipboardList, Download, Zap } from 'lucide-react';

interface SuperAdminDashboardProps {
  onImpersonate: (companyId: string) => void;
  onLogout: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ onImpersonate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'system'>('clients');
  const [stats, setStats] = useState<CompanyStats[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
      active_global_provider: 'ovh',
      ovh_app_key: '', ovh_app_secret: '', ovh_consumer_key: '', ovh_service_name: '',
      twilio_account_sid: '', twilio_auth_token: '', twilio_from_number: '',
      capitole_api_key: '',
      supabase_url: '', supabase_anon_key: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal Add Client
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ 
      name: '', email: '', plan: 'basic' as 'basic' | 'pro',
      siret: '', vat_number: '', address: '', phone: '', contact_name: '', notes: '', password: ''
  });

  // Modal Add Credits
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditForm, setCreditForm] = useState({ 
      companyId: '', companyName: '', amount: 100, price: 0, reference: '' 
  });
  const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    const [companiesData, configData] = await Promise.all([
        ApiService.getAllCompaniesStats(),
        ApiService.getSystemConfig()
    ]);
    setStats(companiesData);
    setSystemConfig(configData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await ApiService.createCompany({
        name: newClient.name,
        email: newClient.email,
        plan: newClient.plan,
        siret: newClient.siret,
        vat_number: newClient.vat_number,
        address: newClient.address,
        phone: newClient.phone,
        contact_name: newClient.contact_name,
        notes: newClient.notes,
        password: newClient.password
    });
    setShowAddModal(false);
    setNewClient({ name: '', email: '', plan: 'basic', siret: '', vat_number: '', address: '', phone: '', contact_name: '', notes: '', password: '' });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client et tous ses logs ?')) {
      await ApiService.deleteCompany(id);
      loadData();
    }
  };

  const openCreditModal = async (companyId: string, companyName: string) => {
      setCreditForm({ companyId, companyName, amount: 100, price: 0, reference: '' });
      
      // Fetch details for history
      const comp = await ApiService.getCompanyDetails(companyId);
      if (comp) {
          setCreditHistory(comp.credit_history || []);
      }
      
      setShowCreditModal(true);
  };

  const handleConfirmCredits = async (e: React.FormEvent) => {
      e.preventDefault();
      if (creditForm.amount > 0) {
          await ApiService.addCredits(creditForm.companyId, creditForm.amount, creditForm.price, creditForm.reference);
          setShowCreditModal(false);
          loadData();
      }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      await ApiService.saveSystemConfig(systemConfig);
      alert("Configuration système enregistrée avec succès !");
  };

  const handleResetAll = async () => {
      if(confirm("ATTENTION : Cette action va effacer TOUS les clients, tous les logs et réinitialiser la base de données à son état d'origine. Êtes-vous sûr ?")) {
          await ApiService.resetAllData();
          loadData();
      }
  };

  const filteredStats = stats.filter(s => 
    s.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalSMS = stats.reduce((acc, curr) => acc + curr.sms_sent, 0);
  const totalErrors = stats.reduce((acc, curr) => acc + curr.errors, 0);

  // Helper to copy text
  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Copié !");
  };

  const downloadFakeInvoice = (ref: string) => {
      alert(`Simulation: Téléchargement de la facture ${ref}.pdf`);
  };

  const renderClientsTab = () => (
    <>
        {/* Global KPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mr-4">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Clients Actifs</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.length}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full mr-4">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">SMS Envoyés (Total)</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalSMS}</h3>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
            <div className="p-3 bg-rose-100 text-rose-600 rounded-full mr-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Erreurs Globales</p>
              <h3 className="text-2xl font-bold text-slate-800">{totalErrors}</h3>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Client
          </button>
        </div>

        {/* Clients Table */}
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Entreprise</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Crédits</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Activité SMS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dernier Log</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                   <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Chargement des données...</td></tr>
                ) : filteredStats.length === 0 ? (
                   <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">Aucun client trouvé.</td></tr>
                ) : (
                  filteredStats.map((stat) => (
                    <tr key={stat.company_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
                            {stat.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{stat.company_name}</div>
                            <div className="text-xs text-slate-500">{stat.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {stat.subscription_plan === 'pro' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
                                PRO
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 uppercase tracking-wide">
                                BASIC
                            </span>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          {stat.use_custom_provider ? (
                              <span className="text-xs font-mono text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                  EXTERNE
                              </span>
                          ) : (
                              <div className="flex items-center space-x-2">
                                  <span className={`font-bold text-sm ${stat.sms_credits < 10 ? 'text-rose-600' : 'text-slate-700'}`}>
                                      {stat.sms_credits}
                                  </span>
                                  <button 
                                    onClick={() => openCreditModal(stat.company_id, stat.company_name)}
                                    className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100 rounded-md px-2 py-1 flex items-center space-x-1 text-xs font-medium transition-colors"
                                    title="Ajouter des crédits"
                                  >
                                      <Plus className="w-3 h-3" />
                                      <span>Ajouter</span>
                                  </button>
                              </div>
                          )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          {stat.sms_sent} envoyés
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {stat.last_activity ? new Date(stat.last_activity).toLocaleDateString('fr-FR') : 'Jamais'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <button
                          onClick={() => onImpersonate(stat.company_id)}
                          className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                          title="Accéder au dashboard client"
                        >
                          <LogIn className="w-4 h-4 mr-1" />
                          Gérer
                        </button>
                        <button
                          onClick={() => handleDelete(stat.company_id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                          title="Supprimer le client"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );

  const renderSystemTab = () => (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* API Keys Form */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                        <Key className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Clés API Globales (Agence)</h3>
                        <p className="text-xs text-slate-500">Fournisseur par défaut pour le mode revendeur</p>
                    </div>
                  </div>
              </div>
              
              <form onSubmit={handleSaveConfig} className="space-y-6">
                  {/* Explanation Banner */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-xs text-indigo-800 space-y-2">
                     <h5 className="font-bold flex items-center"><Server className="w-3 h-3 mr-1"/> Logique "Roue de secours"</h5>
                     <p>Le système utilise le <strong>Fournisseur Global Actif</strong> configuré ci-dessous pour tous les clients n'ayant pas de compte dédié.</p>
                  </div>
                  
                  {/* Provider Selector */}
                  <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Fournisseur Global Actif</label>
                      <select 
                        value={systemConfig.active_global_provider}
                        onChange={e => setSystemConfig({...systemConfig, active_global_provider: e.target.value as SmsProvider})}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border font-medium bg-white"
                      >
                          <option value="ovh">OVH Télécom (Europe)</option>
                          <option value="twilio">Twilio (International)</option>
                          <option value="capitole">Capitole Mobile (France)</option>
                      </select>
                  </div>
                  
                  <div className="border-t border-slate-100"></div>

                  {/* OVH CONFIG */}
                  {systemConfig.active_global_provider === 'ovh' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start">
                             <HelpCircle className="w-4 h-4 text-blue-500 mt-0.5 mr-2 shrink-0" />
                             <div className="text-xs text-blue-700">
                                <p className="mb-1 font-semibold">OVH Config</p>
                                <a href="https://eu.api.ovh.com/createToken/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 inline-flex items-center">
                                    Générer mes clés OVH <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">OVH Application Key (AK)</label>
                            <input type="password" value={systemConfig.ovh_app_key} onChange={e => setSystemConfig({...systemConfig, ovh_app_key: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">OVH Application Secret (AS)</label>
                            <input type="password" value={systemConfig.ovh_app_secret} onChange={e => setSystemConfig({...systemConfig, ovh_app_secret: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">OVH Consumer Key (CK)</label>
                            <input type="password" value={systemConfig.ovh_consumer_key} onChange={e => setSystemConfig({...systemConfig, ovh_consumer_key: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">OVH Service Name</label>
                            <input type="text" value={systemConfig.ovh_service_name} onChange={e => setSystemConfig({...systemConfig, ovh_service_name: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" placeholder="Ex: sms-ab12345-1" />
                        </div>
                    </div>
                  )}

                  {/* TWILIO CONFIG */}
                  {systemConfig.active_global_provider === 'twilio' && (
                    <div className="animate-fade-in space-y-4">
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start">
                             <HelpCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 shrink-0" />
                             <div className="text-xs text-red-700">
                                <p className="mb-1 font-semibold">Twilio Config</p>
                                <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-red-600 underline hover:text-red-800 inline-flex items-center">
                                    Console Twilio <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Account SID</label>
                            <input type="text" value={systemConfig.twilio_account_sid} onChange={e => setSystemConfig({...systemConfig, twilio_account_sid: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" placeholder="AC................" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Auth Token</label>
                            <input type="password" value={systemConfig.twilio_auth_token} onChange={e => setSystemConfig({...systemConfig, twilio_auth_token: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Numéro d'envoi (From) ou Messaging Service SID</label>
                            <input type="text" value={systemConfig.twilio_from_number} onChange={e => setSystemConfig({...systemConfig, twilio_from_number: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" placeholder="+336..." />
                        </div>
                    </div>
                  )}

                  {/* CAPITOLE CONFIG */}
                  {systemConfig.active_global_provider === 'capitole' && (
                    <div className="animate-fade-in space-y-4">
                         <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-start">
                             <Smartphone className="w-4 h-4 text-emerald-500 mt-0.5 mr-2 shrink-0" />
                             <div className="text-xs text-emerald-700">
                                <p className="mb-1 font-semibold">Capitole Mobile Config</p>
                                <a href="https://www.capitolemobile.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 underline hover:text-emerald-800 inline-flex items-center">
                                    Site Capitole Mobile <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Clé API (API Key)</label>
                            <input type="password" value={systemConfig.capitole_api_key} onChange={e => setSystemConfig({...systemConfig, capitole_api_key: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50" placeholder="Votre clé API Capitole" />
                        </div>
                    </div>
                  )}
                  
                  <div className="border-t border-slate-100 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-800 flex items-center"><Database className="w-4 h-4 mr-2" /> Base de données (Supabase)</h4>
                        <a href="https://supabase.com/dashboard/project/_/settings/api" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 underline">
                             Trouver mes clés
                        </a>
                      </div>
                      <div className="space-y-3">
                         <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Supabase URL</label>
                            <input type="text" value={systemConfig.supabase_url} onChange={e => setSystemConfig({...systemConfig, supabase_url: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-xs p-2 border" placeholder="https://xyz.supabase.co" />
                         </div>
                         <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Supabase Anon Key</label>
                            <input type="password" value={systemConfig.supabase_anon_key} onChange={e => setSystemConfig({...systemConfig, supabase_anon_key: e.target.value})} className="block w-full rounded-md border-slate-300 shadow-sm sm:text-xs p-2 border" />
                         </div>
                      </div>
                  </div>

                  <div className="pt-4">
                      <button type="submit" className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all">
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder la configuration
                      </button>
                  </div>
              </form>
          </div>

          <div className="space-y-6">
              {/* API Endpoints Info - NEW ARCHITECTURE */}
              <div className="bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-6 text-slate-300">
                  <div className="flex items-center justify-center space-x-3 mb-4 text-white">
                      <Zap className="w-6 h-6 text-yellow-400" />
                      <h3 className="text-lg font-bold">Architecture Native</h3>
                  </div>
                  
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center mb-6 border border-slate-700">
                      <p className="text-xs text-slate-400 font-mono">
                          Mode <span className="text-emerald-400 font-bold">FULL CODE</span> activé.<br/>
                          Plus besoin de n8n. Next.js gère tout.
                      </p>
                  </div>

                  <p className="text-sm mb-4 text-white text-center font-medium">
                      Configuration OVH Télécom (Ligne VoIP) :
                  </p>
                  <p className="text-xs mb-6 text-slate-400 text-center leading-relaxed">
                      Copiez cette URL unique et collez-la dans votre Manager OVH, rubrique "Gestion des appels" &gt; "Serveur Vocal" ou "Redirection".
                  </p>

                  <div className="space-y-4">
                      <div className="bg-black/40 rounded p-4 border border-indigo-500/30 shadow-inner">
                          <div className="flex justify-between text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wide">
                              <span>Webhook d'Appel Entrant</span>
                              <button onClick={() => copyToClipboard('https://votre-site.vercel.app/api/webhooks/incoming-call')} className="hover:text-white flex items-center"><Copy className="w-3 h-3 mr-1" /> Copier</button>
                          </div>
                          <code className="text-sm font-mono text-white break-all block py-2">
                              https://votre-site.vercel.app/api/webhooks/incoming-call
                          </code>
                      </div>
                  </div>
                  
                  <div className="mt-6 flex items-start space-x-2 text-[10px] text-slate-500">
                      <HelpCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <p>
                          Ce webhook recevra l'appel, vérifiera les crédits, les horaires et la blacklist, puis déclenchera l'envoi du SMS via l'API appropriée (OVH/Twilio/Capitole) directement depuis le serveur.
                      </p>
                  </div>
              </div>

               {/* Danger Zone */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
                  <h4 className="text-rose-800 font-bold flex items-center text-sm mb-2">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Zone de Danger (Tests)
                  </h4>
                  <p className="text-xs text-rose-700 mb-4 leading-relaxed">
                      Utilisez ce bouton pour remettre le simulateur à zéro (suppression de tous les clients, tous les logs et remet les données de démonstration).
                  </p>
                  <button 
                    onClick={handleResetAll}
                    className="w-full border border-rose-300 text-rose-700 bg-rose-100 hover:bg-rose-200 py-2 rounded font-bold text-xs uppercase tracking-wide transition-colors"
                  >
                      Réinitialiser toutes les données
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {/* Navbar Admin */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-500 p-2 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                    <h1 className="text-xl font-bold tracking-tight">Portail Super Admin</h1>
                    <p className="text-indigo-300 text-xs">Gestion centralisée des clients</p>
                    </div>
                </div>
                <button 
                    onClick={onLogout}
                    className="text-slate-400 hover:text-white transition-colors text-sm font-medium"
                >
                    Déconnexion
                </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-8 mt-2">
                <button 
                    onClick={() => setActiveTab('clients')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                        activeTab === 'clients' 
                        ? 'border-indigo-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Mes Clients</span>
                </button>
                <button 
                    onClick={() => setActiveTab('system')}
                    className={`pb-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                        activeTab === 'system' 
                        ? 'border-indigo-500 text-white' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                >
                    <Server className="w-4 h-4" />
                    <span>Système & API</span>
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'clients' ? renderClientsTab() : renderSystemTab()}
      </main>

      {/* Modal Add Client */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Ajouter un nouveau client</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-6">
                
              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* LEFT: Identity */}
                  <div className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                          <Briefcase className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-indigo-800 uppercase">Identité Juridique</h4>
                      </div>
                      <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Raison Sociale *</label>
                            <input required type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="Garage Dupont SAS" />
                          </div>
                           <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">SIRET</label>
                                    <input type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                        value={newClient.siret} onChange={e => setNewClient({...newClient, siret: e.target.value})} placeholder="123..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">N° TVA Intra.</label>
                                    <input type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                        value={newClient.vat_number} onChange={e => setNewClient({...newClient, vat_number: e.target.value})} placeholder="FR..." />
                                </div>
                           </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Adresse Complète</label>
                            <input type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} placeholder="12 rue de la Paix, 75000 Paris" />
                          </div>
                      </div>
                  </div>

                  {/* RIGHT: Contact & Login */}
                  <div className="space-y-4">
                       <div className="flex items-center space-x-2 border-b border-indigo-100 pb-2">
                          <Lock className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-indigo-800 uppercase">Contact & Accès</h4>
                      </div>
                      <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Nom Contact Principal</label>
                            <input type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                value={newClient.contact_name} onChange={e => setNewClient({...newClient, contact_name: e.target.value})} placeholder="M. Dupont" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Téléphone</label>
                            <input type="text" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} placeholder="06..." />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Email (Login) *</label>
                            <input required type="email" className="block w-full rounded border-slate-300 text-sm p-2 border" 
                                value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} placeholder="admin@garage.com" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Mot de passe initial *</label>
                            <input required type="text" className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50 font-mono" 
                                value={newClient.password} onChange={e => setNewClient({...newClient, password: e.target.value})} placeholder="Secret123" />
                          </div>
                      </div>
                  </div>
              </div>
              
              {/* Bottom: Offer & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-4">
                  <div>
                      <div className="flex items-center space-x-2 mb-2">
                          <ClipboardList className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-indigo-800 uppercase">Offre Commerciale</h4>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Forfait (Plan)</label>
                        <select
                            className="block w-full rounded border-slate-300 text-sm p-2 border bg-white"
                            value={newClient.plan}
                            onChange={e => setNewClient({...newClient, plan: e.target.value as 'basic' | 'pro'})}
                        >
                            <option value="basic">Basic (Standard)</option>
                            <option value="pro">Pro (Complet)</option>
                        </select>
                      </div>
                  </div>
                   <div>
                      <div className="flex items-center space-x-2 mb-2">
                          <FileText className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-xs font-bold text-indigo-800 uppercase">Notes Internes</h4>
                      </div>
                      <textarea
                        className="block w-full rounded border-slate-300 text-sm p-2 border"
                        rows={2}
                        value={newClient.notes}
                        onChange={e => setNewClient({...newClient, notes: e.target.value})}
                        placeholder="Infos confidentielles (ex: payeur tardif, recommandé par X...)"
                      />
                  </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Créer le client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Credits */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-full text-emerald-600">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Gestion des Crédits</h3>
                        <p className="text-xs text-slate-500">Client : <strong>{creditForm.companyName}</strong></p>
                    </div>
                </div>
                <button onClick={() => setShowCreditModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Form ADD */}
                <form onSubmit={handleConfirmCredits} className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 flex items-center">
                        <Plus className="w-4 h-4 mr-1"/> Nouvelle Transaction
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Quantité SMS</label>
                            <input
                            required
                            type="number"
                            min="1"
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-lg p-2 border font-bold text-emerald-600"
                            value={creditForm.amount}
                            onChange={e => setCreditForm({...creditForm, amount: parseInt(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Montant Payé (€)</label>
                            <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 text-lg p-2 border font-bold text-slate-700"
                            value={creditForm.price}
                            onChange={e => setCreditForm({...creditForm, price: parseFloat(e.target.value)})}
                            />
                        </div>
                        <div className="col-span-2">
                             <label className="block text-xs font-bold text-slate-600 mb-1">Référence / Facture</label>
                             <input
                                type="text"
                                className="block w-full rounded-md border-slate-300 shadow-sm text-sm p-2 border"
                                placeholder="Ex: FAC-2024-001"
                                value={creditForm.reference}
                                onChange={e => setCreditForm({...creditForm, reference: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                         <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Valider la recharge
                        </button>
                    </div>
                </form>

                {/* History Table */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-slate-400"/> Historique des Achats
                    </h4>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Réf.</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Crédits</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Prix/U</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 uppercase">Facture</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {creditHistory.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-xs text-slate-400">Aucune transaction</td></tr>
                                ) : (
                                    creditHistory.map((tx) => (
                                        <tr key={tx.id}>
                                            <td className="px-4 py-2 text-xs text-slate-500">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2 text-xs text-slate-900 font-medium">{tx.reference}</td>
                                            <td className="px-4 py-2 text-xs text-emerald-600 font-bold text-right">+{tx.amount_credits}</td>
                                            <td className="px-4 py-2 text-xs text-slate-400 text-right">
                                                {tx.amount_paid > 0 ? (tx.amount_paid / tx.amount_credits).toFixed(2) + '€' : '-'}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button 
                                                    onClick={() => downloadFakeInvoice(tx.reference)}
                                                    className="text-indigo-500 hover:text-indigo-700" title="Télécharger facture"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};