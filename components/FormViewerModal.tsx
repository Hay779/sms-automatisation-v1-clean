
import React from 'react';
import { FormSubmission } from '../types';
import { X, Calendar, Phone, CheckCircle, Image, FileText, User, ChevronDown } from 'lucide-react';

interface FormViewerModalProps {
  submission: FormSubmission;
  onClose: () => void;
  onUpdateStatus?: (status: 'new' | 'pending' | 'done' | 'archived') => void;
}

export const FormViewerModal: React.FC<FormViewerModalProps> = ({ submission, onClose, onUpdateStatus }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                    <FileText className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 text-lg">Dossier Client</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase tracking-wider font-bold">
                        TICKET: {submission.ticket_number || 'N/A'}
                    </p>
                </div>
            </div>
            
            <div className="flex items-center space-x-3">
                {/* Status Dropdown */}
                {onUpdateStatus && (
                    <div className="relative group">
                         <select
                            value={submission.status}
                            onChange={(e) => onUpdateStatus(e.target.value as any)}
                            className={`appearance-none pl-3 pr-8 py-1.5 text-xs font-bold uppercase rounded-full border cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 ${
                                submission.status === 'new' ? 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                submission.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200 focus:ring-amber-500' :
                                submission.status === 'done' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 focus:ring-emerald-500' :
                                'bg-slate-100 text-slate-600 border-slate-200 focus:ring-slate-500'
                            }`}
                         >
                             <option value="new">Nouveau</option>
                             <option value="pending">En cours</option>
                             <option value="done">Traité</option>
                             <option value="archived">Archivé</option>
                         </select>
                         <ChevronDown className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                    </div>
                )}

                <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            
            {/* Meta Data */}
            <div className="grid grid-cols-2 gap-4 bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm">
                        <Phone className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-400 font-bold uppercase">Client</p>
                        <p className="font-mono font-medium text-indigo-900">{submission.phone}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-indigo-400 font-bold uppercase">Reçu le</p>
                        <p className="font-mono font-medium text-indigo-900">{new Date(submission.created_at).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Answers */}
            <div className="space-y-4">
                <h4 className="font-bold text-slate-800 border-b pb-2">Réponses au formulaire</h4>
                
                {submission.answers.length === 0 && <p className="text-slate-400 italic">Aucune réponse fournie.</p>}

                {submission.answers.map((answer, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-indigo-300 transition-colors">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">{answer.label}</p>
                        
                        {/* Render logic based on content type simulation */}
                        {typeof answer.value === 'string' && answer.value.includes('Fichier') ? (
                            <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded border border-slate-200">
                                <Image className="w-5 h-5 text-slate-400" />
                                <span className="text-sm text-indigo-600 underline cursor-pointer hover:text-indigo-800">{answer.value}</span>
                            </div>
                        ) : typeof answer.value === 'boolean' ? (
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${answer.value ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                {answer.value ? 'Oui' : 'Non'}
                             </span>
                        ) : typeof answer.value === 'object' && answer.value !== null ? (
                            <div className="bg-slate-50 rounded-lg p-3 space-y-2 border border-slate-200">
                                <div className="flex items-center space-x-2 text-indigo-600 mb-2">
                                    <User className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase">Contact</span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div><span className="text-xs text-slate-400">Nom :</span> <span className="font-medium text-slate-800">{(answer.value as any).lastName}</span></div>
                                    <div><span className="text-xs text-slate-400">Prénom :</span> <span className="font-medium text-slate-800">{(answer.value as any).firstName}</span></div>
                                    <div className="col-span-2"><span className="text-xs text-slate-400">Email :</span> <span className="font-medium text-slate-800">{(answer.value as any).email}</span></div>
                                    <div className="col-span-2"><span className="text-xs text-slate-400">Adresse :</span> <span className="font-medium text-slate-800">{(answer.value as any).address}</span></div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-800 whitespace-pre-wrap">{String(answer.value)}</p>
                        )}
                    </div>
                ))}
            </div>

             {/* Marketing Opt-in */}
             {submission.marketing_optin && (
                 <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                     <CheckCircle className="w-5 h-5" />
                     <span className="text-sm font-medium">Le client a accepté de recevoir des offres marketing.</span>
                 </div>
             )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end space-x-3">
             {onUpdateStatus && submission.status !== 'archived' && (
                <button 
                    onClick={() => onUpdateStatus('archived')}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                    Archiver
                </button>
             )}
             {onUpdateStatus && submission.status === 'new' && (
                 <button 
                    onClick={() => onUpdateStatus('done')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                 >
                    Marquer comme Traité
                 </button>
             )}
        </div>
      </div>
    </div>
  );
};
