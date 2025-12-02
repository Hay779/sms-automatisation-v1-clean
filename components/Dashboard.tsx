
import React, { useState } from 'react';
import { SmsLog, DashboardStats, Settings } from '../types';
import { StatCard } from './StatCard';
import { LogTable } from './LogTable';
import { MessageSquare, PhoneMissed, AlertTriangle, Power, PhoneIncoming, CreditCard, Shield, Wallet, Coins } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  logs: SmsLog[];
  settings: Settings;
  onToggleStatus: () => void;
  onSimulateCall: () => Promise<void>;
  showTutorial: boolean;
}

// Composant interne pour les bulles d'aide
const TutorialTooltip = ({ text, position }: { text: string, position: string }) => (
  <div className={`absolute z-50 w-64 ${position}`}>
    <div className="relative bg-blue-600 text-white text-xs p-3 rounded-lg shadow-xl border border-blue-500 animate-bounce-subtle">
      {text}
      <div className={`absolute w-3 h-3 bg-blue-600 transform rotate-45 ${
        position.includes('bottom') ? '-top-1.5 left-1/2 -translate-x-1/2' : 
        position.includes('top') ? '-bottom-1.5 left-1/2 -translate-x-1/2' :
        position.includes('left') ? '-right-1.5 top-1/2 -translate-y-1/2' :
        '-left-1.5 top-1/2 -translate-y-1/2'
      }`}></div>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  logs, 
  settings, 
  onToggleStatus, 
  onSimulateCall,
  showTutorial 
}) => {
  // Defensive Check
  if (!settings) return null;

  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulateClick = async () => {
    setIsSimulating(true);
    await onSimulateCall();
    setIsSimulating(false);
  };

  // Compute chart data from logs
  const chartData = [
    { name: 'Envoyés', value: stats.sms_sent, fill: '#10b981' },
    { name: 'Filtrés', value: stats.calls_filtered, fill: '#64748b' },
    { name: 'Erreurs', value: stats.errors, fill: '#f43f5e' },
  ];

  const replacedMessage = settings.sms_message
    .replace('{{company}}', settings.company_name || '')
    .replace('{{form_link}}', 'https://votre-app.com/f/DEMO');

  return (
    <div className="space-y-6">
      {/* Top Status Banner & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Status Card */}
        <div className="relative md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between">
            {showTutorial && (
              <TutorialTooltip 
                text="Interrupteur général. En position 'Désactivé', le système ne répondra plus aux appels. Idéal pour la maintenance ou les vacances." 
                position="bottom-full left-1/2 -translate-x-1/2 mb-2" 
              />
            )}
            <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Power className={`w-5 h-5 mr-2 ${settings.auto_sms_enabled ? 'text-emerald-500' : 'text-rose-500'}`} />
                Système {settings.auto_sms_enabled ? 'Actif' : 'En Pause'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
                {settings.auto_sms_enabled 
                ? "Le robot traite les appels et envoie les SMS."
                : "Aucun SMS ne sera envoyé (Maintenance)."}
            </p>
            </div>
            <button
            onClick={onToggleStatus}
            className={`mt-4 sm:mt-0 px-5 py-2.5 rounded-lg font-bold text-sm border transition-all ${
                settings.auto_sms_enabled
                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-rose-600'
                : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
            }`}
            >
            {settings.auto_sms_enabled ? 'Désactiver' : 'Activer le système'}
            </button>
        </div>

        {/* Wallet / Credit Card */}
        <div className="relative md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
             {showTutorial && (
              <TutorialTooltip 
                text="Votre solde de SMS. Si vous passez par l'agence, vous devez recharger. Si vous avez votre propre compte (OVH/Twilio), c'est illimité ici." 
                position="bottom-full left-1/2 -translate-x-1/2 mb-2" 
              />
            )}
            <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium">Solde SMS</span>
            </div>
            
            {settings.use_custom_provider ? (
                 <div>
                    <span className="text-xl font-bold text-indigo-600">Illimité</span>
                    <p className="text-xs text-slate-400 mt-1">Facturation Externe ({settings.custom_provider_type.toUpperCase()})</p>
                 </div>
            ) : (
                <div>
                     <div className="flex items-baseline space-x-1">
                        <span className={`text-3xl font-bold ${settings.sms_credits < 10 ? 'text-rose-600' : 'text-slate-800'}`}>
                            {settings.sms_credits}
                        </span>
                        <span className="text-sm text-slate-500">crédits</span>
                     </div>
                     {settings.sms_credits < 10 && (
                         <p className="text-xs text-rose-500 mt-1 font-medium flex items-center">
                             <AlertTriangle className="w-3 h-3 mr-1" />
                             Solde bas, rechargez !
                         </p>
                     )}
                </div>
            )}
        </div>

        {/* Simulation Card */}
        <div className="relative md:col-span-1 bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 p-6 flex flex-col justify-center items-center text-center">
            {showTutorial && (
              <TutorialTooltip 
                text="Cliquez ici pour tester ! Cela simule un appel entrant aléatoire et vous montre instantanément si le SMS part ou est bloqué." 
                position="bottom-full left-1/2 -translate-x-1/2 mb-2" 
              />
            )}
            <h4 className="text-indigo-900 font-semibold text-sm mb-2">Zone de Test</h4>
            <button
                onClick={handleSimulateClick}
                disabled={isSimulating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
            >
                {isSimulating ? (
                    <span className="animate-pulse">Traitement...</span>
                ) : (
                    <>
                        <PhoneIncoming className="w-4 h-4 mr-2" />
                        Simuler un appel
                    </>
                )}
            </button>
            <p className="text-xs text-indigo-400 mt-2">Génère un numéro aléatoire (06, 07 ou fixe)</p>
        </div>
      </div>
      
       {/* Critical Alert */}
       {(!settings.use_custom_provider && settings.sms_credits < 5) && (
            <div className="bg-rose-600 rounded-lg p-4 shadow-lg flex items-center justify-between text-white animate-pulse">
                <div className="flex items-center">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    <div>
                        <h4 className="font-bold">CRITIQUE : Solde SMS épuisé</h4>
                        <p className="text-sm text-rose-100">Le système ne peut plus envoyer de messages. Contactez votre administrateur immédiatement.</p>
                    </div>
                </div>
                <div className="bg-white text-rose-600 px-3 py-1 rounded font-bold">
                    {settings.sms_credits} restants
                </div>
            </div>
       )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="SMS Envoyés"
          value={stats.sms_sent}
          icon={<MessageSquare className="w-6 h-6" />}
          color="emerald"
          description="Total SMS délivrés avec succès"
        />
        <StatCard
          title="Appels Filtrés"
          value={stats.calls_filtered}
          icon={<PhoneMissed className="w-6 h-6" />}
          color="slate"
          description="Fixes, hors horaires ou cooldown"
        />
        <StatCard
          title="Erreurs"
          value={stats.errors}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="rose"
          description="Echecs API ou solde insuffisant"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h4 className="font-semibold text-slate-700 mb-4">Répartition des Appels</h4>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Message Preview */}
        <div className="relative lg:col-span-2 bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 text-white flex flex-col justify-center">
            {showTutorial && (
              <TutorialTooltip 
                text="Voici exactement ce que vos clients recevront. Vous pouvez modifier ce texte et l'expéditeur dans l'onglet 'Paramètres'." 
                position="bottom-full left-1/2 -translate-x-1/2 mb-2" 
              />
            )}
            <h4 className="font-medium text-slate-400 mb-2 uppercase text-xs tracking-wider">Aperçu du SMS actuel</h4>
            <div className="bg-slate-800 rounded-lg p-4 relative">
                <div className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/4 bg-blue-600 text-xs font-bold px-2 py-1 rounded shadow-lg">
                    EXP: {settings.sms_sender_id || 'INFO'}
                </div>
                <p className="font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {replacedMessage}
                </p>
            </div>
            <p className="text-xs text-slate-500 mt-4 flex justify-between items-center">
                <span>Délai de sécurité (cooldown) : {settings.cooldown_seconds} secondes</span>
                <span className="flex items-center">
                   {settings.use_custom_provider ? (
                       <span className="text-indigo-400 flex items-center mr-2"><CreditCard className="w-3 h-3 mr-1" /> Compte Dédié</span>
                   ) : (
                       <span className="text-emerald-400 flex items-center mr-2"><Shield className="w-3 h-3 mr-1" /> Mode Agence</span>
                   )}
                   ID Entreprise : {settings.company_name}
                </span>
            </p>
        </div>
      </div>

      {/* Logs Table */}
      <LogTable logs={logs} />
    </div>
  );
};
