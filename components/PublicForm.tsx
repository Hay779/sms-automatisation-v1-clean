
import React, { useState } from 'react';
import { Settings, FormBlock } from '../types';
import { Image, Video, CheckSquare, MapPin, Phone, ArrowLeft, Send } from 'lucide-react';
import { ApiService } from '../services/supabaseApi';

interface PublicFormProps {
  settings: Settings;
  onClose: () => void;
  companyId: string;
}

export const PublicForm: React.FC<PublicFormProps> = ({ settings, onClose, companyId }) => {
  const formConfig = settings.web_form;
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [marketingOptin, setMarketingOptin] = useState(false);

  const handleInputChange = (blockId: string, value: any) => {
    setFormData(prev => ({ ...prev, [blockId]: value }));
  };

  const handleContactChange = (blockId: string, field: string, value: string) => {
    setFormData(prev => ({
        ...prev,
        [blockId]: {
            ...(prev[blockId] || {}),
            [field]: value
        }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Extract phone from contact_info block
    const contactBlock = formConfig.blocks.find(b => b.type === 'contact_info');
    let phone = '0000000000'; // Default fallback
    
    if (contactBlock && formData[contactBlock.id]) {
      // Try to get phone from contact block
      phone = formData[contactBlock.id].phone || formData[contactBlock.id].email || '0000000000';
    }
    
    // Prepare data
    const answers = Object.entries(formData).map(([blockId, value]) => {
        const block = formConfig.blocks.find(b => b.id === blockId);
        return {
            blockId,
            label: block?.label || 'Question',
            value
        };
    });

    // Generate ticket number
    const ticketNum = `#REQ-${Date.now().toString().slice(-6)}`;

    try {
        await ApiService.submitForm({
          company_id: companyId,
          phone: phone,
          answers: answers,
          marketing_optin: marketingOptin,
          status: 'new',
          ticket_number: ticketNum
        });
        setTicketNumber(ticketNum);
    } catch (error) {
        console.error('Submit error:', error);
        alert("Erreur lors de l'envoi. Vérifiez votre connexion.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (ticketNumber) {
      return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <Send className="w-10 h-10 text-emerald-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Demande reçue !</h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Votre Numéro de Ticket</p>
                  <p className="text-2xl font-mono font-bold text-indigo-600">{ticketNumber}</p>
              </div>
              <p className="text-slate-600 mb-8 max-w-sm mx-auto leading-relaxed">
                  Merci. L'équipe <strong>{settings.company_name}</strong> a bien reçu vos éléments.
                  <br/>
                  Une confirmation vous a été envoyée.
              </p>
              <button onClick={onClose} className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-lg">
                  Fermer la fenêtre
              </button>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 md:flex md:items-center md:justify-center">
        {/* Mobile Container Emulator */}
        <div className="w-full md:w-[400px] md:h-[800px] bg-white md:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
            
            {/* Header / Nav */}
            <div className="bg-white p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">SIMULATION CLIENT</span>
                <div className="w-5"></div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Brand Header */}
                <div className="p-8 text-center bg-white pb-6">
                     {formConfig.logo_url ? (
                        <img src={formConfig.logo_url} alt="Logo" className="h-16 mx-auto mb-4 object-contain" />
                    ) : (
                        <div className="h-16 w-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-300 font-bold text-xl">LOG</div>
                    )}
                    <h1 className="text-xl font-bold text-slate-900">{formConfig.page_title}</h1>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {formConfig.blocks.map(block => (
                        <div key={block.id}>
                            {block.type === 'header' && (
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-l-4 border-indigo-500 pl-3 mt-4 mb-2">
                                    {block.label}
                                </h3>
                            )}

                            {block.type === 'paragraph' && (
                                <p className="text-sm text-slate-600 text-center leading-relaxed">
                                    {block.label}
                                </p>
                            )}

                            {block.type === 'separator' && <hr className="border-slate-100 my-6" />}

                            {(block.type === 'text' || block.type === 'textarea') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                                        {block.label} {block.required && <span className="text-rose-500">*</span>}
                                    </label>
                                    {block.type === 'text' ? (
                                        <input 
                                            type="text" 
                                            required={block.required}
                                            placeholder={block.placeholder}
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            onChange={e => handleInputChange(block.id, e.target.value)}
                                        />
                                    ) : (
                                        <textarea 
                                            required={block.required}
                                            rows={4}
                                            placeholder={block.placeholder}
                                            className="w-full bg-slate-50 border-slate-200 rounded-lg text-sm p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                            onChange={e => handleInputChange(block.id, e.target.value)}
                                        />
                                    )}
                                </div>
                            )}

                            {block.type === 'checkbox' && (
                                <label className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center h-5">
                                        <input 
                                            type="checkbox" 
                                            className="h-5 w-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                            onChange={e => handleInputChange(block.id, e.target.checked ? 'Oui' : 'Non')}
                                        />
                                    </div>
                                    <span className="text-sm text-slate-700 font-medium">{block.label}</span>
                                </label>
                            )}

                            {(block.type === 'photo' || block.type === 'video') && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                                        {block.label} {block.required && <span className="text-rose-500">*</span>}
                                    </label>
                                    <div className="relative group cursor-pointer">
                                        <input 
                                            type="file" 
                                            accept={block.type === 'photo' ? 'image/*' : 'video/*'}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={e => handleInputChange(block.id, "Fichier simulé.jpg")} 
                                        />
                                        <div className="h-24 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500 transition-all">
                                            {block.type === 'photo' ? <Image className="w-6 h-6 mb-2" /> : <Video className="w-6 h-6 mb-2" />}
                                            <span className="text-xs font-medium">Appuyez pour ajouter</span>
                                        </div>
                                    </div>
                                    {formData[block.id] && (
                                        <p className="text-xs text-emerald-600 mt-1 flex items-center">
                                            <CheckSquare className="w-3 h-3 mr-1" /> Fichier sélectionné
                                        </p>
                                    )}
                                </div>
                            )}

                            {block.type === 'contact_info' && (
                                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                     <h4 className="text-xs font-bold text-slate-700 uppercase">{block.label}</h4>
                                     <div className="grid grid-cols-2 gap-3">
                                         <input
                                            type="text"
                                            placeholder="Nom"
                                            required={block.required}
                                            className="w-full bg-white border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={e => handleContactChange(block.id, 'lastName', e.target.value)}
                                         />
                                         <input
                                            type="text"
                                            placeholder="Prénom"
                                            required={block.required}
                                            className="w-full bg-white border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={e => handleContactChange(block.id, 'firstName', e.target.value)}
                                         />
                                         <input
                                            type="email"
                                            placeholder="Email"
                                            required={block.required}
                                            className="col-span-2 w-full bg-white border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={e => handleContactChange(block.id, 'email', e.target.value)}
                                         />
                                         <input
                                            type="tel"
                                            placeholder="Téléphone"
                                            required={block.required}
                                            className="col-span-2 w-full bg-white border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={e => handleContactChange(block.id, 'phone', e.target.value)}
                                         />
                                         <input
                                            type="text"
                                            placeholder="Adresse complète"
                                            className="col-span-2 w-full bg-white border-slate-200 rounded-lg text-sm p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                            onChange={e => handleContactChange(block.id, 'address', e.target.value)}
                                         />
                                     </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {formConfig.enable_marketing && (
                        <div className="pt-4">
                            <label className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100 cursor-pointer">
                                <div className="flex items-center h-5">
                                    <input 
                                        type="checkbox" 
                                        checked={marketingOptin}
                                        onChange={e => setMarketingOptin(e.target.checked)}
                                        className="h-5 w-5 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
                                    />
                                </div>
                                <span className="text-xs text-emerald-900 leading-snug">
                                    {formConfig.marketing_text}
                                </span>
                            </label>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-8"
                    >
                        {isSubmitting ? 'Envoi en cours...' : 'ENVOYER MA DEMANDE'}
                    </button>
                </form>

                {/* Footer */}
                <div className="bg-slate-50 p-6 text-center border-t border-slate-200 mt-8 pb-10">
                    <p className="font-bold text-slate-700 text-sm mb-2">{settings.company_name}</p>
                    {formConfig.company_address && (
                        <p className="text-xs text-slate-500 flex items-center justify-center mb-1">
                            <MapPin className="w-3 h-3 mr-1" /> {formConfig.company_address}
                        </p>
                    )}
                    {formConfig.company_phone && (
                        <p className="text-xs text-slate-500 flex items-center justify-center">
                            <Phone className="w-3 h-3 mr-1" /> {formConfig.company_phone}
                        </p>
                    )}
                    <p className="text-[8px] text-slate-400 mt-2">Powered by SMS Manager</p>
                </div>
            </div>
        </div>
    </div>
  );
};
