
import React, { useState } from 'react';
import { SmsLog, LogStatus, FormSubmission } from '../types';
import { Phone, AlertCircle, CheckCircle, Ban, Search, Filter, Download, FileText, ArrowRight } from 'lucide-react';
import { ApiService } from '../services/api';
import { FormViewerModal } from './FormViewerModal';

interface LogTableProps {
  logs: SmsLog[];
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LogStatus | 'all'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);

  // Date Filtering
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const getStatusBadge = (status: LogStatus) => {
    switch (status) {
      case LogStatus.SENT:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Envoyé
          </span>
        );
      case LogStatus.FILTERED:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            <Ban className="w-3 h-3 mr-1" />
            Filtré
          </span>
        );
      case LogStatus.ERROR:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Erreur
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.phone.includes(searchTerm) || (log.message && log.message.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
    
    let matchesDate = true;
    if (dateStart) {
        matchesDate = matchesDate && new Date(log.created_at) >= new Date(dateStart);
    }
    if (dateEnd) {
        // End of the day
        const end = new Date(dateEnd);
        end.setHours(23, 59, 59);
        matchesDate = matchesDate && new Date(log.created_at) <= end;
    }

    return matchesSearch && matchesFilter && matchesDate;
  });

  const handleExportCSV = () => {
    const headers = ["Date", "Numéro", "Statut", "Raison", "Message", "Dossier Reçu"];
    const rows = filteredLogs.map(log => [
      `"${log.created_at}"`,
      `"${log.phone}"`,
      `"${log.status}"`,
      `"${log.reason}"`,
      `"${log.message.replace(/"/g, '""')}"`,
      `"${log.has_submission ? 'Oui' : 'Non'}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `export_sms_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDossier = async (phone: string) => {
      // Find latest submission for this phone
      const submissions = await ApiService.getSubmissions();
      const sub = submissions.find(s => s.phone === phone);
      if (sub) {
          setSelectedSubmission(sub);
      } else {
          alert("Dossier introuvable ou archivé.");
      }
  };

  return (
    <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-3 xl:space-y-0">
        <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-slate-800">Historique</h3>
            <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{filteredLogs.length}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
             {/* Date Pickers */}
             <div className="flex items-center space-x-2">
                <input 
                    type="date" 
                    className="text-xs border border-slate-300 rounded p-1.5"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                />
                <span className="text-slate-400">-</span>
                <input 
                    type="date" 
                    className="text-xs border border-slate-300 rounded p-1.5"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                />
             </div>

            {/* Search */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Chercher..."
                    className="block w-full sm:w-40 pl-10 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filter */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                    className="block w-full sm:w-32 pl-10 pr-8 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                >
                    <option value="all">Tout</option>
                    <option value={LogStatus.SENT}>Envoyés</option>
                    <option value={LogStatus.FILTERED}>Filtrés</option>
                    <option value={LogStatus.ERROR}>Erreurs</option>
                </select>
            </div>

            {/* Export */}
            <button 
                onClick={handleExportCSV}
                className="flex items-center justify-center px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                title="Télécharger CSV"
            >
                <Download className="w-4 h-4 mr-2 sm:mr-0 md:mr-2" />
                <span className="sm:hidden md:inline">Export</span>
            </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Numéro</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dossier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Message</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {filteredLogs.length === 0 ? (
               <tr>
                 <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Aucun historique correspondant</td>
               </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center">
                    <Phone className="w-3 h-3 mr-2 text-slate-400" />
                    {log.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(log.status)}
                    {log.status === LogStatus.FILTERED && (
                        <span className="ml-2 text-xs text-slate-400 font-mono">({log.reason})</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.has_submission ? (
                          <button 
                            onClick={() => handleViewDossier(log.phone)}
                            className="inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                          >
                              <FileText className="w-3 h-3 mr-1" />
                              Voir Dossier
                          </button>
                      ) : (
                          <span className="text-slate-300 text-xs">-</span>
                      )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={log.message}>
                    {log.message || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

       {selectedSubmission && (
            <FormViewerModal 
                submission={selectedSubmission} 
                onClose={() => setSelectedSubmission(null)} 
            />
        )}
    </div>
  );
};
