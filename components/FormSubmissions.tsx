
import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/supabaseApi';
import { FormSubmission } from '../types';
import { FormViewerModal } from './FormViewerModal';
import { ExternalLink, Search, Calendar, FileText, ChevronRight, Inbox, CheckCircle, Archive, Clock, AlertCircle } from 'lucide-react';

interface FormSubmissionsProps {
  onOpenSimulator: () => void;
}

type TabType = 'todo' | 'all' | 'archived';

export const FormSubmissions: React.FC<FormSubmissionsProps> = ({ onOpenSimulator }) => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('todo');

  const loadData = async () => {
      setIsLoading(true);
      const data = await ApiService.getSubmissions();
      setSubmissions(data);
      setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: any) => {
      await ApiService.updateSubmissionStatus(id, newStatus);
      await loadData(); // Reload to refresh list
      if (selectedSubmission && selectedSubmission.id === id) {
          setSelectedSubmission(prev => prev ? ({ ...prev, status: newStatus }) : null);
      }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'new': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 uppercase"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>Nouveau</span>;
          case 'pending': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700 uppercase"><Clock className="w-3 h-3 mr-1"/>En cours</span>;
          case 'done': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700 uppercase"><CheckCircle className="w-3 h-3 mr-1"/>Traité</span>;
          case 'archived': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500 uppercase"><Archive className="w-3 h-3 mr-1"/>Archivé</span>;
          default: return null;
      }
  };

  const filtered = submissions.filter(s => {
      // Search Filter
      const matchesSearch = s.phone.includes(searchTerm) || (s.ticket_number && s.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Tab Filter
      let matchesTab = true;
      if (activeTab === 'todo') matchesTab = (s.status === 'new' || s.status === 'pending');
      if (activeTab === 'archived') matchesTab = (s.status === 'archived');
      // 'all' includes everything except archived usually, or truly everything. Let's say truly everything for 'all' but maybe separate archived.
      // Let's make 'all' exclude archived to keep it clean, or keep it simple.
      // Standard CRM: All usually implies Active.
      if (activeTab === 'all') matchesTab = (s.status !== 'archived');

      return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
        
        {/* Header & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-xl font-bold text-slate-800">Boîte de réception</h2>
                <p className="text-sm text-slate-500">Gérez les dossiers de qualification envoyés par vos clients.</p>
            </div>
            <button 
                onClick={onOpenSimulator}
                className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors border border-indigo-100"
            >
                <ExternalLink className="w-4 h-4 mr-2" />
                Tester le formulaire public
            </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
             
             {/* Tabs & Toolbar */}
             <div className="border-b border-slate-200 bg-slate-50">
                 <div className="flex items-center px-4 pt-4 space-x-6">
                     <button 
                        onClick={() => setActiveTab('todo')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === 'todo' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                     >
                         <AlertCircle className="w-4 h-4" />
                         <span>À traiter</span>
                         {submissions.filter(s => s.status === 'new').length > 0 && (
                             <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{submissions.filter(s => s.status === 'new').length}</span>
                         )}
                     </button>
                     <button 
                        onClick={() => setActiveTab('all')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === 'all' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                     >
                         <Inbox className="w-4 h-4" />
                         <span>Tous les dossiers</span>
                     </button>
                     <button 
                        onClick={() => setActiveTab('archived')}
                        className={`pb-3 text-sm font-medium border-b-2 flex items-center space-x-2 transition-colors ${activeTab === 'archived' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                     >
                         <Archive className="w-4 h-4" />
                         <span>Archives</span>
                     </button>
                 </div>
                 
                 <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-white">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Chercher par tél ou ticket..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all focus:w-80"
                        />
                    </div>
                    <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {filtered.length} Résultat(s)
                    </div>
                 </div>
             </div>

             {/* List */}
             {isLoading ? (
                 <div className="p-12 text-center text-slate-400">Chargement...</div>
             ) : filtered.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                     <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                         <Inbox className="w-8 h-8 text-slate-300" />
                     </div>
                     <p className="text-slate-500 font-medium">Aucun dossier dans cette vue.</p>
                 </div>
             ) : (
                 <div className="divide-y divide-slate-100">
                     {filtered.map(sub => (
                         <div 
                            key={sub.id} 
                            onClick={() => setSelectedSubmission(sub)}
                            className={`p-4 cursor-pointer transition-all flex items-center justify-between group ${sub.status === 'new' ? 'bg-blue-50/30 hover:bg-blue-50/60' : 'hover:bg-slate-50'}`}
                        >
                             <div className="flex items-center space-x-4">
                                 {/* Status Dot for New */}
                                 {sub.status === 'new' && (
                                     <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></div>
                                 )}
                                 
                                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                                     {sub.phone.slice(-2)}
                                 </div>
                                 <div>
                                     <div className="flex items-center space-x-2">
                                         <h4 className={`text-sm ${sub.status === 'new' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>{sub.phone}</h4>
                                         {sub.ticket_number && (
                                            <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded text-slate-500 border border-slate-200 shadow-sm">
                                                {sub.ticket_number}
                                            </span>
                                         )}
                                         {getStatusBadge(sub.status)}
                                     </div>
                                     <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                         <Calendar className="w-3 h-3 mr-1" />
                                         {new Date(sub.created_at).toLocaleDateString()} à {new Date(sub.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </div>
                                 </div>
                             </div>

                             <div className="hidden md:block flex-1 mx-8">
                                 <div className="flex space-x-2 overflow-hidden">
                                     {sub.answers.slice(0, 3).map((ans, i) => (
                                         <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-white text-slate-600 text-xs border border-slate-200 truncate max-w-[150px]">
                                             {ans.label}: <strong className="ml-1 font-medium">{String(ans.value).substring(0, 15)}...</strong>
                                         </span>
                                     ))}
                                     {sub.answers.length > 3 && <span className="text-xs text-slate-400 self-center">+{sub.answers.length - 3}</span>}
                                 </div>
                             </div>

                             <div className="text-slate-300 group-hover:text-indigo-500 transition-colors">
                                 <ChevronRight className="w-5 h-5" />
                             </div>
                         </div>
                     ))}
                 </div>
             )}
        </div>

        {selectedSubmission && (
            <FormViewerModal 
                submission={selectedSubmission} 
                onClose={() => setSelectedSubmission(null)}
                onUpdateStatus={(status) => handleStatusUpdate(selectedSubmission.id, status)}
            />
        )}
    </div>
  );
};
