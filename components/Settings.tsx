import React, { useState, useEffect } from 'react';
import { Settings as SettingsType, BlockType, FormBlock } from '../types';
import { Save, Zap, Clock, Building2, Shield, Eye, EyeOff, CreditCard, ExternalLink, Smartphone, CalendarClock, Globe, LayoutTemplate, Image, Type, Video, FileText, Siren, Plus, X, Percent, MapPin, GripVertical, ArrowUp, ArrowDown, Trash2, CheckSquare, AlignLeft, Minus, Phone, User, Mail, QrCode, Bell, MessageSquare, Upload, Palette } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  onSave: (newSettings: SettingsType) => Promise<void>;
  companyId?: string;
}

type TabType = 'general' | 'schedule' | 'form' | 'billing' | 'security';

export const Settings: React.FC<SettingsProps> = ({ settings, onSave, companyId }) => {
  const [formData, setFormData] = useState<SettingsType>(settings);
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newBlockType, setNewBlockType] = useState<BlockType>('text');
  const [showQRCode, setShowQRCode] = useState(false);

  // Sync state if props change (for impersonation switching)
  useEffect(() => {
      setFormData(settings);
  }, [settings]);

  // -- HANDLERS GENERIC --
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'sms_sender_id') {
        const cleaned = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 11);
        setFormData(prev => ({ ...prev, [name]: cleaned }));
        return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }));
  };

  const handleToggle = () => {
    setFormData(prev => ({ ...prev, auto_sms_enabled: !prev.auto_sms_enabled }));
  };

  const insertVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      sms_message: prev.sms_message + ` ${variable}`
    }));
  };

  const insertTemplateVariable = (field: string, variable: string) => {
       setFormData(prev => ({
          ...prev,
          web_form: {
              ...prev.web_form,
              [field]: (prev.web_form as any)[field] + ` ${variable}`
          }
      }));
  };

  // -- LOGO UPLOAD HANDLER --
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData(prev => ({
                  ...prev,
                  web_form: { ...prev.web_form, logo_url: reader.result as string }
              }));
          };
          reader.readAsDataURL(file);
      }
  };

  // -- HANDLERS SCHEDULE --
  const handleScheduleToggle = () => {
      setFormData(prev => ({ 
          ...prev, 
          active_schedule: { ...prev.active_schedule, enabled: !prev.active_schedule.enabled } 
      }));
  };

  const handleDayToggle = (dayIndex: number) => {
      const currentDays = formData.active_schedule.days;
      const newDays = currentDays.includes(dayIndex) 
        ? currentDays.filter(d => d !== dayIndex)
        : [...currentDays, dayIndex];
      
      setFormData(prev => ({
          ...prev,
          active_schedule: { ...prev.active_schedule, days: newDays.sort() }
      }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          active_schedule: { ...prev.active_schedule, [name]: value }
      }));
  };

  // -- HANDLERS FORM WEB (PAGE BUILDER) --
  const handleFormToggle = () => {
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, enabled: !prev.web_form.enabled }
      }));
  };

  const handleFormHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, [name]: value }
      }));
  };
  
  const handleMarketingToggle = () => {
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, enable_marketing: !prev.web_form.enable_marketing }
      }));
  };
  
  const handleFormCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
       const { name, checked } = e.target;
       setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, [name]: checked }
      }));
  };

  // BLOCK CRUD
  const addBlock = () => {
      const newBlock: FormBlock = {
          id: `blk_${Date.now()}`,
          type: newBlockType,
          label: newBlockType === 'header' ? 'Nouveau Titre' : newBlockType === 'separator' ? '' : 'Nouvelle Question',
          required: false,
          placeholder: newBlockType === 'text' || newBlockType === 'textarea' ? 'Réponse...' : undefined
      };
      
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, blocks: [...prev.web_form.blocks, newBlock] }
      }));
  };

  const removeBlock = (id: string) => {
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, blocks: prev.web_form.blocks.filter(b => b.id !== id) }
      }));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
      const blocks = [...formData.web_form.blocks];
      if (direction === 'up' && index > 0) {
          [blocks[index], blocks[index - 1]] = [blocks[index - 1], blocks[index]];
      } else if (direction === 'down' && index < blocks.length - 1) {
          [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
      }
      setFormData(prev => ({
          ...prev,
          web_form: { ...prev.web_form, blocks }
      }));
  };

  const updateBlock = (id: string, updates: Partial<FormBlock>) => {
      setFormData(prev => ({
          ...prev,
          web_form: { 
              ...prev.web_form, 
              blocks: prev.web_form.blocks.map(b => b.id === id ? { ...b, ...updates } : b) 
          }
      }));
  };

  // -- HANDLERS BILLING --
  const handleCustomProviderToggle = () => {
      setFormData(prev => ({ ...prev, use_custom_provider: !prev.use_custom_provider }));
  };

  // -- SUBMIT --
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      await onSave(formData);
      await new Promise(resolve => setTimeout(resolve, 300));
      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } finally {
      setIsSaving(false);
    }
  };

  const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const getBlockIcon = (type: BlockType) => {
      switch(type) {
          case 'header': return <Type className="w-4 h-4" />;
          case 'paragraph': return <AlignLeft className="w-4 h-4" />;
          case 'text': return <AlignLeft className="w-4 h-4" />;
          case 'textarea': return <FileText className="w-4 h-4" />;
          case 'photo': return <Image className="w-4 h-4" />;
          case 'video': return <Video className="w-4 h-4" />;
          case 'checkbox': return <CheckSquare className="w-4 h-4" />;
          case 'separator': return <Minus className="w-4 h-4" />;
          case 'contact_info': return <User className="w-4 h-4" />;
      }
  };

  const renderTabContent = () => {
      switch(activeTab) {
          case 'general':
              return (
                <div className="space-y-6 animate-fade-in">
                    {/* Company Identity */}
                    <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                        <div className="flex items-center space-x-2 text-slate-800 mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold">Identité de l'entreprise</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                                <input
                                    type="text"
                                    name="company_name"
                                    value={formData.company_name}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nom d'expéditeur SMS (Sender ID)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-100 text-slate-500">
                                        <Smartphone className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        name="sms_sender_id"
                                        value={formData.sms_sender_id}
                                        onChange={handleChange}
                                        className="block w-full rounded-r-md border-slate-300 shadow-sm sm:text-sm p-2 border uppercase font-mono"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1">Max 11 caractères alphanumériques (Ex: PIZZALUIGI).</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Slogan / Sous-titre</label>
                                <input
                                    type="text"
                                    name="company_tagline"
                                    value={formData.company_tagline}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Status Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${formData.auto_sms_enabled ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <label className="font-semibold text-slate-800 block">Activation Automatique</label>
                            <p className="text-xs text-slate-500">Si désactivé, aucun SMS ne sera envoyé.</p>
                        </div>
                        </div>
                        <button
                        type="button"
                        onClick={handleToggle}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                            formData.auto_sms_enabled ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                        >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.auto_sms_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    {/* SMS Message */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Message SMS</label>
                        <textarea
                        name="sms_message"
                        rows={4}
                        value={formData.sms_message}
                        onChange={handleChange}
                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                        <span className="text-xs text-slate-500 mr-2 self-center">Insérer :</span>
                        {['{{phone}}', '{{date}}', '{{heure}}', '{{company}}', '{{form_link}}'].map((v) => (
                            <button
                            key={v}
                            type="button"
                            onClick={() => insertVariable(v)}
                            className="inline-flex items-center px-2 py-1 rounded border border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                            >
                            {v}
                            </button>
                        ))}
                        </div>
                    </div>

                    {/* Cooldown */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Anti-Spam (Cooldown)</label>
                        <div className="relative rounded-md shadow-sm max-w-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="number"
                            name="cooldown_seconds"
                            min="0"
                            value={formData.cooldown_seconds}
                            onChange={handleChange}
                            className="block w-full rounded-md border-slate-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-slate-500 sm:text-sm">secondes</span>
                        </div>
                        </div>
                    </div>
                </div>
              );

          case 'schedule':
              return (
                  <div className="space-y-6 animate-fade-in">
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-full ${formData.active_schedule.enabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                                        <CalendarClock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <label className="font-semibold text-slate-800 block">Plages Horaires d'Activation</label>
                                        <p className="text-xs text-slate-500">Envoyer des SMS uniquement pendant les heures d'ouverture.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleScheduleToggle}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 ${
                                        formData.active_schedule.enabled ? 'bg-emerald-600' : 'bg-slate-200'
                                    }`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.active_schedule.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                            </div>

                            {formData.active_schedule.enabled && (
                                <div className="pt-2 animate-fade-in space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Heure de début</label>
                                            <input 
                                                type="time" 
                                                name="start_time"
                                                value={formData.active_schedule.start_time}
                                                onChange={handleTimeChange}
                                                className="block w-full rounded border-slate-300 text-sm p-2 border bg-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-600 mb-1">Heure de fin</label>
                                            <input 
                                                type="time" 
                                                name="end_time"
                                                value={formData.active_schedule.end_time}
                                                onChange={handleTimeChange}
                                                className="block w-full rounded border-slate-300 text-sm p-2 border bg-white" 
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-2">Jours Actifs</label>
                                        <div className="flex flex-wrap gap-2">
                                            {daysOfWeek.map((day, index) => {
                                                const isActive = formData.active_schedule.days.includes(index);
                                                return (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => handleDayToggle(index)}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                                                            isActive 
                                                            ? 'bg-blue-600 text-white border-blue-600' 
                                                            : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {day}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                      </div>
                  </div>
              );

          case 'form':
              return (
                  <div className="space-y-6 animate-fade-in">
                       {/* ENABLE TOGGLE */}
                       <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                            <div className="flex items-center space-x-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                    <LayoutTemplate className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <label className="font-semibold text-slate-800 block">Activer le formulaire</label>
                                    <p className="text-xs text-slate-500">Lien public pour que vos clients envoient des infos.</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleFormToggle}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                    formData.web_form.enabled ? 'bg-indigo-600' : 'bg-slate-200'
                                }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData.web_form.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                       </div>

                       {formData.web_form.enabled && (
                           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-4">
                               {/* LEFT COLUMN: EDITOR */}
                               <div className="space-y-4">
                                   
                                   {/* 0. QR & SHARE */}
                                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <h5 className="font-bold text-sm text-slate-700">Lien & Partage</h5>
                                            <button 
                                                type="button"
                                                onClick={() => setShowQRCode(!showQRCode)} 
                                                className="text-xs flex items-center text-indigo-600 hover:text-indigo-800"
                                            >
                                                <QrCode className="w-3 h-3 mr-1" />
                                                {showQRCode ? 'Masquer QR' : 'Voir QR Code'}
                                            </button>
                                        </div>
                                        <div className="bg-slate-50 p-2 rounded border border-slate-200 text-xs font-mono text-slate-600 truncate flex justify-between items-center">
                                            <span>https://app.pro/f/CLIENT-ID</span>
                                            <ExternalLink className="w-3 h-3 text-slate-400" />
                                        </div>
                                        {showQRCode && (
    <div className="mt-4 flex justify-center p-4 bg-white border border-slate-100 rounded-lg">
        <canvas 
            ref={(canvas) => {
                if (canvas && companyId) {
                    const formUrl = `${window.location.origin}/form/${companyId}`;
                    import('qrcode').then(QRCode => {
                        QRCode.toCanvas(canvas, formUrl, { 
                            width: 128,
                            margin: 2,
                            color: {
                                dark: '#1e293b',
                                light: '#ffffff'
                            }
                        }).catch(err => console.error('QR Code error:', err));
                    });
                }
            }}
            className="border border-slate-200 rounded"
        />
    </div>
)}
                                   </div>

                                   {/* 1. NOTIFICATIONS */}
                                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                                        <h5 className="font-bold text-sm text-slate-700 flex items-center border-b pb-2">
                                            <Bell className="w-4 h-4 mr-2 text-indigo-600" /> 
                                            Notifications
                                        </h5>
                                        
                                        {/* Admin Notifications */}
                                        <div className="space-y-4">
                                            <h6 className="text-xs font-bold text-slate-500 uppercase flex items-center bg-slate-50 p-1.5 rounded">Alertes pour VOUS (Admin)</h6>
                                            
                                            {/* Admin Email */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">Email</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        name="notify_admin_email" 
                                                        checked={formData.web_form.notify_admin_email} 
                                                        onChange={handleFormCheckbox}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                {formData.web_form.notify_admin_email && (
                                                    <div className="pl-6 space-y-2 animate-fade-in">
                                                        <input 
                                                            type="email" 
                                                            name="admin_notification_email"
                                                            value={formData.web_form.admin_notification_email} 
                                                            onChange={handleFormHeaderChange}
                                                            placeholder="votre@email.com"
                                                            className="w-full text-xs p-2 border border-slate-300 rounded mb-2" 
                                                        />
                                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Modèle Email</span>
                                                                <div className="flex space-x-1">
                                                                     {['{{ticket}}', '{{client_phone}}'].map(v => (
                                                                         <button key={v} type="button" onClick={() => insertTemplateVariable('admin_email_body', v)} className="text-[9px] bg-white border px-1 rounded hover:bg-blue-50 text-blue-600">{v}</button>
                                                                     ))}
                                                                </div>
                                                            </div>
                                                            <input 
                                                                type="text"
                                                                name="admin_email_subject"
                                                                value={formData.web_form.admin_email_subject || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Sujet de l'email"
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                            <textarea
                                                                name="admin_email_body"
                                                                value={formData.web_form.admin_email_body || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Corps de l'email..."
                                                                rows={3}
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Admin SMS */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Smartphone className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">SMS</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        name="notify_admin_sms" 
                                                        checked={formData.web_form.notify_admin_sms} 
                                                        onChange={handleFormCheckbox}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                {formData.web_form.notify_admin_sms && (
                                                    <div className="pl-6 space-y-2 animate-fade-in">
                                                        <input 
                                                            type="text" 
                                                            name="admin_notification_phone"
                                                            value={formData.web_form.admin_notification_phone} 
                                                            onChange={handleFormHeaderChange}
                                                            placeholder="+336..."
                                                            className="w-full text-xs p-2 border border-slate-300 rounded mb-2" 
                                                        />
                                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                                             <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Modèle SMS</span>
                                                            </div>
                                                            <textarea
                                                                name="admin_sms_message"
                                                                value={formData.web_form.admin_sms_message || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Texte du SMS..."
                                                                rows={2}
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-slate-100"></div>

                                        {/* Client Notifications */}
                                        <div className="space-y-4">
                                            <h6 className="text-xs font-bold text-slate-500 uppercase flex items-center bg-slate-50 p-1.5 rounded">Confirmations pour le CLIENT</h6>
                                            
                                            {/* Client Email */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Mail className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">Email</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        name="notify_client_email" 
                                                        checked={formData.web_form.notify_client_email} 
                                                        onChange={handleFormCheckbox}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                {formData.web_form.notify_client_email && (
                                                    <div className="pl-6 space-y-2 animate-fade-in">
                                                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Modèle Email</span>
                                                                <div className="flex space-x-1">
                                                                     {['{{ticket}}', '{{company}}', '{{date}}'].map(v => (
                                                                         <button key={v} type="button" onClick={() => insertTemplateVariable('client_email_body', v)} className="text-[9px] bg-white border px-1 rounded hover:bg-blue-50 text-blue-600">{v}</button>
                                                                     ))}
                                                                </div>
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                name="client_email_subject"
                                                                value={formData.web_form.client_email_subject || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Sujet de l'email"
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                            <textarea
                                                                name="client_email_body"
                                                                value={formData.web_form.client_email_body || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Corps de l'email..."
                                                                rows={3}
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Client SMS */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Smartphone className="w-4 h-4 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-700">SMS</span>
                                                    </div>
                                                    <input 
                                                        type="checkbox" 
                                                        name="notify_client_sms" 
                                                        checked={formData.web_form.notify_client_sms} 
                                                        onChange={handleFormCheckbox}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                                                    />
                                                </div>
                                                {formData.web_form.notify_client_sms && (
                                                    <div className="pl-6 space-y-2 animate-fade-in">
                                                         <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                                                             <div className="flex justify-between items-center">
                                                                <span className="text-[10px] font-bold text-slate-500 uppercase">Modèle SMS</span>
                                                            </div>
                                                            <textarea
                                                                name="client_sms_message"
                                                                value={formData.web_form.client_sms_message || ''}
                                                                onChange={handleFormHeaderChange}
                                                                placeholder="Texte du SMS..."
                                                                rows={2}
                                                                className="w-full text-xs p-2 border border-slate-300 rounded"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                   </div>

                                   {/* 2. BRANDING HEADER WITH UPLOAD */}
                                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                                        <h5 className="font-bold text-sm text-slate-700 border-b pb-2">2. En-tête & Identité</h5>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-2">Logo de l'entreprise</label>
                                                <div className="flex items-center space-x-3">
                                                    {formData.web_form.logo_url && (
                                                        <img src={formData.web_form.logo_url} alt="Logo" className="h-16 w-16 object-contain rounded border border-slate-200 bg-white p-1" />
                                                    )}
                                                    <div className="flex-1">
                                                        <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                                                            <Upload className="w-3 h-3 mr-2" />
                                                            {formData.web_form.logo_url ? 'Changer le logo' : 'Importer un logo'}
                                                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                                        </label>
                                                        <p className="text-[10px] text-slate-400 mt-1">PNG, JPG ou SVG (max 2 Mo)</p>
                                                    </div>
                                                    {formData.web_form.logo_url && (
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setFormData(prev => ({ ...prev, web_form: { ...prev.web_form, logo_url: '' } }))}
                                                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Titre Page</label>
                                                <input type="text" name="page_title" value={formData.web_form.page_title} onChange={handleFormHeaderChange} className="block w-full rounded border-slate-300 text-sm p-2 border" />
                                            </div>
                                        </div>
                                   </div>

                                   {/* 3. BLOCKS EDITOR */}
                                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                                       <div className="flex justify-between items-center border-b pb-2">
                                            <h5 className="font-bold text-sm text-slate-700">3. Blocs du Formulaire</h5>
                                            <div className="flex items-center space-x-2">
                                                <select 
                                                    className="text-xs border-slate-300 rounded p-1 bg-slate-50 border"
                                                    value={newBlockType}
                                                    onChange={e => setNewBlockType(e.target.value as BlockType)}
                                                >
                                                    <option value="paragraph">Paragraphe (Info)</option>
                                                    <option value="contact_info">Bloc Coordonnées (Contact)</option>
                                                    <option value="text">Texte court</option>
                                                    <option value="textarea">Texte long</option>
                                                    <option value="checkbox">Case à cocher</option>
                                                    <option value="photo">Photo</option>
                                                    <option value="video">Vidéo</option>
                                                    <option value="header">Titre de section</option>
                                                    <option value="separator">Séparateur</option>
                                                </select>
                                                <button type="button" onClick={addBlock} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700 flex items-center">
                                                    <Plus className="w-3 h-3 mr-1"/> Ajouter
                                                </button>
                                            </div>
                                       </div>

                                       <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                                           {formData.web_form.blocks.length === 0 && (
                                               <p className="text-xs text-slate-400 text-center py-4 italic">Aucun bloc. Ajoutez-en un !</p>
                                           )}
                                           {formData.web_form.blocks.map((block, index) => (
                                               <div key={block.id} className="group flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2 rounded hover:border-indigo-300 transition-colors">
                                                   {/* Handle */}
                                                   <div className="flex flex-col items-center text-slate-300 space-y-1">
                                                       <button type="button" disabled={index === 0} onClick={() => moveBlock(index, 'up')} className="hover:text-slate-600 disabled:opacity-30"><ArrowUp className="w-3 h-3"/></button>
                                                       <GripVertical className="w-4 h-4 cursor-move"/>
                                                       <button type="button" disabled={index === formData.web_form.blocks.length - 1} onClick={() => moveBlock(index, 'down')} className="hover:text-slate-600 disabled:opacity-30"><ArrowDown className="w-3 h-3"/></button>
                                                   </div>

                                                   {/* Icon */}
                                                   <div className="p-2 bg-white rounded border border-slate-100 text-slate-500">
                                                       {getBlockIcon(block.type)}
                                                   </div>

                                                   {/* Editor */}
                                                   <div className="flex-1 space-y-1">
                                                       <div className="flex items-center justify-between">
                                                           <span className="text-[10px] font-bold uppercase text-slate-400">{block.type === 'header' ? 'Titre' : block.type}</span>
                                                           {block.type !== 'separator' && block.type !== 'header' && block.type !== 'paragraph' && (
                                                               <label className="flex items-center space-x-1 cursor-pointer">
                                                                   <input 
                                                                    type="checkbox" 
                                                                    checked={block.required} 
                                                                    onChange={e => updateBlock(block.id, { required: e.target.checked })}
                                                                    className="rounded text-indigo-600 w-3 h-3 focus:ring-0" 
                                                                   />
                                                                   <span className="text-[10px] text-slate-500">Obligatoire</span>
                                                               </label>
                                                           )}
                                                       </div>
                                                       {block.type !== 'separator' && (
                                                           <input 
                                                            type="text" 
                                                            value={block.label} 
                                                            onChange={e => updateBlock(block.id, { label: e.target.value })}
                                                            className="block w-full text-xs p-1.5 rounded border-slate-300 focus:border-indigo-500 focus:ring-indigo-500" 
                                                            placeholder={block.type === 'text' ? 'Texte ou question...' : 'Libellé...'}
                                                           />
                                                       )}
                                                   </div>

                                                   {/* Delete */}
                                                   <button type="button" onClick={() => removeBlock(block.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded">
                                                       <Trash2 className="w-4 h-4" />
                                                   </button>
                                               </div>
                                           ))}
                                       </div>
                                   </div>

                                   {/* 4. FOOTER & STYLING */}
                                   <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-4">
                                       <h5 className="font-bold text-sm text-slate-700 border-b pb-2 flex items-center">
                                           <Palette className="w-4 h-4 mr-2 text-indigo-600" />
                                           4. Pied de page & Options
                                       </h5>
                                       
                                       {/* Footer Content */}
                                       <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
                                                <input type="text" name="company_address" value={formData.web_form.company_address} onChange={handleFormHeaderChange} className="block w-full rounded border-slate-300 text-sm p-2 border" placeholder="12 rue..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                                                <input type="text" name="company_phone" value={formData.web_form.company_phone} onChange={handleFormHeaderChange} className="block w-full rounded border-slate-300 text-sm p-2 border" placeholder="01..." />
                                            </div>
                                       </div>

                                       {/* Footer Styling */}
                                       <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                                           <h6 className="text-xs font-bold text-slate-600 flex items-center">
                                               <Palette className="w-3 h-3 mr-1" />
                                               Personnalisation du pied de page
                                           </h6>
                                           <div className="grid grid-cols-2 gap-3">
                                               <div>
                                                   <label className="block text-[10px] font-medium text-slate-500 mb-1">Couleur de fond</label>
                                                   <input 
                                                       type="color" 
                                                       name="footer_bg_color" 
                                                       value={(formData.web_form as any).footer_bg_color || '#f1f5f9'} 
                                                       onChange={handleFormHeaderChange}
                                                       className="h-8 w-full rounded border-slate-300 cursor-pointer"
                                                   />
                                               </div>
                                               <div>
                                                   <label className="block text-[10px] font-medium text-slate-500 mb-1">Couleur du texte</label>
                                                   <input 
                                                       type="color" 
                                                       name="footer_text_color" 
                                                       value={(formData.web_form as any).footer_text_color || '#64748b'} 
                                                       onChange={handleFormHeaderChange}
                                                       className="h-8 w-full rounded border-slate-300 cursor-pointer"
                                                   />
                                               </div>
                                           </div>
                                           <div>
                                               <label className="block text-[10px] font-medium text-slate-500 mb-1">Texte personnalisé (optionnel)</label>
                                               <input 
                                                   type="text" 
                                                   name="footer_custom_text" 
                                                   value={(formData.web_form as any).footer_custom_text || ''} 
                                                   onChange={handleFormHeaderChange}
                                                   placeholder="Ex: © 2025 - Tous droits réservés"
                                                   className="block w-full rounded border-slate-300 text-xs p-2 border"
                                               />
                                           </div>
                                       </div>

                                       {/* Marketing Opt-in */}
                                        <div className="pt-2">
                                            <label className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-200">
                                               <input type="checkbox" name="enable_marketing" checked={formData.web_form.enable_marketing} onChange={handleMarketingToggle} className="text-indigo-600 rounded h-4 w-4" />
                                               <div className="flex-1">
                                                    <span className="font-medium flex items-center text-xs"><Percent className="w-3 h-3 mr-1 text-emerald-500"/> Opt-in Promotions</span>
                                                    <p className="text-[10px] text-slate-500">Ajouter la case "Recevoir nos offres" à la fin.</p>
                                               </div>
                                            </label>

                                            {formData.web_form.enable_marketing && (
                                                <div className="mt-2 animate-fade-in pl-7">
                                                     <label className="block text-[10px] font-bold text-slate-500 mb-1">Texte de la promotion</label>
                                                     <input 
                                                        type="text" 
                                                        name="marketing_text"
                                                        value={formData.web_form.marketing_text || 'Je souhaite recevoir des offres exclusives et promotions.'} 
                                                        onChange={handleFormHeaderChange} 
                                                        className="block w-full rounded border-slate-300 text-xs p-1.5 border" 
                                                     />
                                                </div>
                                            )}
                                        </div>
                                   </div>
                               </div>

                               {/* RIGHT COLUMN: PHONE PREVIEW */}
                               <div className="flex justify-center items-start pt-4 sticky top-4">
                                   <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] shadow-2xl p-4 border-[6px] border-slate-800 ring-1 ring-slate-900/50">
                                       {/* Notch */}
                                       <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
                                       
                                       {/* Screen */}
                                       <div className="w-full h-full bg-slate-50 rounded-[2rem] overflow-hidden overflow-y-auto flex flex-col relative no-scrollbar">
                                            {/* Hero/Header */}
                                            <div className="bg-white p-6 pb-6 pt-10 text-center shadow-sm relative border-b border-slate-100">
                                                {formData.web_form.logo_url ? (
                                                    <img src={formData.web_form.logo_url} alt="Logo" className="h-12 mx-auto mb-3 object-contain" />
                                                ) : (
                                                    <div className="h-12 w-12 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-slate-400"><Image className="w-6 h-6"/></div>
                                                )}
                                                <h3 className="font-bold text-slate-800 leading-tight text-lg">{formData.web_form.page_title || 'Titre de la page'}</h3>
                                            </div>

                                            {/* Dynamic Content */}
                                            <div className="p-4 space-y-4 flex-1">
                                                {formData.web_form.blocks.map(block => (
                                                    <div key={block.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                        {block.type === 'header' && (
                                                            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-l-2 border-indigo-500 pl-2 mt-4 mb-2">
                                                                {block.label}
                                                            </h4>
                                                        )}

                                                        {block.type === 'paragraph' && (
                                                            <p className="text-xs text-slate-900 text-center font-medium leading-relaxed my-4">
                                                                {block.label}
                                                            </p>
                                                        )}

                                                        {block.type === 'separator' && (
                                                            <hr className="border-slate-400 my-4 border-2" />
                                                        )}

                                                        {block.type === 'text' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                                    {block.label} {block.required && <span className="text-rose-500">*</span>}
                                                                </label>
                                                                <div className="h-8 bg-white border border-slate-200 rounded px-2 flex items-center text-xs text-slate-400">
                                                                    {block.placeholder || '...'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.type === 'textarea' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                                    {block.label} {block.required && <span className="text-rose-500">*</span>}
                                                                </label>
                                                                <div className="h-16 bg-white border border-slate-200 rounded p-2 text-xs text-slate-400">
                                                                    {block.placeholder || '...'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.type === 'checkbox' && (
                                                            <div className="flex items-center space-x-2 bg-white p-2 rounded border border-slate-200">
                                                                <div className="w-4 h-4 rounded border border-slate-300"></div>
                                                                <span className="text-xs text-slate-700 font-medium">{block.label}</span>
                                                            </div>
                                                        )}

                                                        {block.type === 'photo' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                                    {block.label} {block.required && <span className="text-rose-500">*</span>}
                                                                </label>
                                                                <div className="h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400">
                                                                    <Image className="w-5 h-5 mb-1" />
                                                                    <span className="text-[9px]">Appuyez pour prendre une photo</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.type === 'video' && (
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-slate-600 mb-1">
                                                                    {block.label} {block.required && <span className="text-rose-500">*</span>}
                                                                </label>
                                                                <div className="h-20 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400">
                                                                    <Video className="w-5 h-5 mb-1" />
                                                                    <span className="text-[9px]">Ajouter une vidéo</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {block.type === 'contact_info' && (
                                                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-2">
                                                                <h5 className="text-[10px] font-bold uppercase text-slate-500">{block.label}</h5>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="bg-white border border-slate-200 h-7 rounded px-2 flex items-center text-[10px] text-slate-300">Nom</div>
                                                                    <div className="bg-white border border-slate-200 h-7 rounded px-2 flex items-center text-[10px] text-slate-300">Prénom</div>
                                                                    <div className="col-span-2 bg-white border border-slate-200 h-7 rounded px-2 flex items-center text-[10px] text-slate-300">Email</div>
                                                                    <div className="col-span-2 bg-white border border-slate-200 h-7 rounded px-2 flex items-center text-[10px] text-slate-300">Téléphone</div>
                                                                    <div className="col-span-2 bg-white border border-slate-200 h-7 rounded px-2 flex items-center text-[10px] text-slate-300">Adresse</div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {/* Marketing Opt-in */}
                                                {formData.web_form.enable_marketing && (
                                                    <div className="flex items-start space-x-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100 mt-6">
                                                        <div className="w-3 h-3 mt-0.5 rounded border border-emerald-400 bg-white"></div>
                                                        <p className="text-[9px] text-emerald-800 leading-tight">
                                                            {formData.web_form.marketing_text || "Je souhaite recevoir des offres exclusives et promotions."}
                                                        </p>
                                                    </div>
                                                )}

                                                <button type="button" className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-xs shadow-lg mt-4 mb-8">Envoyer ma demande</button>
                                            </div>

                                            {/* Footer with Custom Styling */}
                                            <div 
                                                className="p-4 text-center border-t border-slate-200"
                                                style={{ 
                                                    backgroundColor: (formData.web_form as any).footer_bg_color || '#f1f5f9',
                                                    color: (formData.web_form as any).footer_text_color || '#64748b'
                                                }}
                                            >
                                                <p className="text-[10px] font-bold">{formData.company_name}</p>
                                                {formData.web_form.company_address && (
                                                    <p className="text-[9px] mt-1 flex items-center justify-center">
                                                        <MapPin className="w-2 h-2 mr-1" />
                                                        {formData.web_form.company_address}
                                                    </p>
                                                )}
                                                {formData.web_form.company_phone && (
                                                    <p className="text-[9px] mt-1 flex items-center justify-center">
                                                        <Phone className="w-2 h-2 mr-1" />
                                                        {formData.web_form.company_phone}
                                                    </p>
                                                )}
                                                {(formData.web_form as any).footer_custom_text && (
                                                    <p className="text-[8px] mt-2 opacity-80">
                                                        {(formData.web_form as any).footer_custom_text}
                                                    </p>
                                                )}
                                                <p className="text-[8px] mt-2 opacity-60">Powered by SMS Manager</p>
                                            </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}
                  </div>
              );

          case 'billing':
              return (
                  <div className="space-y-6 animate-fade-in">
                       {/* CUSTOM SMS Provider Section */}
                        <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-indigo-800">
                                    <CreditCard className="w-5 h-5" />
                                    <h4 className="font-semibold">Fournisseur SMS & Facturation</h4>
                                </div>
                                <div className="flex items-center">
                                    <span className={`text-xs mr-3 font-medium ${formData.use_custom_provider ? 'text-indigo-600' : 'text-slate-500'}`}>
                                        {formData.use_custom_provider ? 'Compte Dédié (Client)' : 'Compte Global (Agence)'}
                                    </span>
                                    <button
                                    type="button"
                                    onClick={handleCustomProviderToggle}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                                        formData.use_custom_provider ? 'bg-indigo-600' : 'bg-slate-300'
                                    }`}
                                    >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        formData.use_custom_provider ? 'translate-x-5' : 'translate-x-0'
                                        }`}
                                    />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="text-xs text-indigo-700 leading-relaxed">
                                {formData.use_custom_provider ? (
                                    <p>✅ <strong>Mode Compte Dédié :</strong> Vous utilisez vos propres identifiants. La facturation des SMS est directement entre vous et le fournisseur de votre choix.</p>
                                ) : (
                                    <p>ℹ️ <strong>Mode Agence :</strong> Vous utilisez le système global. Les SMS sont déduits de votre solde de crédits prépayés.</p>
                                )}
                            </div>

                            {formData.use_custom_provider && (
                                <div className="bg-white p-4 rounded-lg border border-indigo-100 space-y-4 animate-fade-in">
                                    {/* Provider Selector */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-600 mb-1">Choix du Fournisseur</label>
                                        <div className="relative">
                                            <select 
                                                name="custom_provider_type" 
                                                value={formData.custom_provider_type || 'ovh'} 
                                                onChange={handleChange}
                                                className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50 appearance-none font-medium text-slate-700"
                                            >
                                                <option value="ovh">OVH Télécom (Europe)</option>
                                                <option value="twilio">Twilio (International)</option>
                                                <option value="capitole">Capitole Mobile (France)</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* OVH Form */}
                                    {formData.custom_provider_type === 'ovh' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                            <div className="md:col-span-2 text-right">
                                                    <a href="https://eu.api.ovh.com/createToken/" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center justify-end">
                                                            Générer mes clés OVH <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Application Key (AK)</label>
                                                <input type="password" name="ovh_app_key" value={formData.ovh_app_key || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Application Secret (AS)</label>
                                                <input type="password" name="ovh_app_secret" value={formData.ovh_app_secret || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Consumer Key (CK)</label>
                                                <input type="password" name="ovh_consumer_key" value={formData.ovh_consumer_key || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Service Name</label>
                                                <input type="text" name="ovh_service_name" value={formData.ovh_service_name || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" placeholder="sms-ab12345-1" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Twilio Form */}
                                    {formData.custom_provider_type === 'twilio' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                <div className="md:col-span-2 text-right">
                                                    <a href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-red-500 hover:text-red-700 flex items-center justify-end">
                                                            Console Twilio <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Account SID</label>
                                                <input type="text" name="twilio_account_sid" value={formData.twilio_account_sid || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" placeholder="AC................" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Auth Token</label>
                                                <input type="password" name="twilio_auth_token" value={formData.twilio_auth_token || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Numéro d'envoi (From) ou Messaging Service SID</label>
                                                <input type="text" name="twilio_from_number" value={formData.twilio_from_number || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" placeholder="+336..." />
                                            </div>
                                        </div>
                                    )}

                                    {/* Capitole Form */}
                                    {formData.custom_provider_type === 'capitole' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                                <div className="md:col-span-2 text-right">
                                                    <a href="https://www.capitolemobile.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-500 hover:text-emerald-700 flex items-center justify-end">
                                                            Site Capitole Mobile <ExternalLink className="w-3 h-3 ml-1" />
                                                    </a>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium text-slate-600 mb-1">Clé API (API Key)</label>
                                                <input type="password" name="capitole_api_key" value={formData.capitole_api_key || ''} onChange={handleChange} className="block w-full rounded border-slate-300 text-sm p-2 border bg-slate-50" placeholder="Votre clé API Capitole" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                  </div>
              );

          case 'security':
              return (
                  <div className="space-y-6 animate-fade-in">
                       <div className="bg-rose-50 p-5 rounded-lg border border-rose-100 space-y-4">
                            <div className="flex items-center space-x-2 text-rose-800 mb-2">
                                <Shield className="w-5 h-5" />
                                <h4 className="font-semibold">Sécurité & Connexion</h4>
                            </div>
                            <p className="text-xs text-rose-600 mb-4">Modifiez ici vos identifiants d'accès au tableau de bord.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Administrateur</label>
                                    <input
                                        type="email"
                                        name="admin_email"
                                        value={formData.admin_email}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                                    <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="admin_password"
                                        value={formData.admin_password}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm p-2 border pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* TAB HEADER */}
        <div className="border-b border-slate-200 bg-slate-50">
            <nav className="flex -mb-px px-4 space-x-4 overflow-x-auto" aria-label="Tabs">
                <button
                    type="button"
                    onClick={() => setActiveTab('general')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>Général</span>
                </button>
                 <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === 'schedule' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <CalendarClock className="w-4 h-4" />
                    <span>Horaires</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('form')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === 'form' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <LayoutTemplate className="w-4 h-4" />
                    <span>Formulaire Web</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('billing')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === 'billing' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <CreditCard className="w-4 h-4" />
                    <span>Facturation</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                        activeTab === 'security' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                >
                    <Shield className="w-4 h-4" />
                    <span>Sécurité</span>
                </button>
            </nav>
        </div>

        {/* TAB CONTENT */}
        <div className="p-6 min-h-[400px]">
            {renderTabContent()}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <div>
            {message && (
                <span className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {message.text}
                </span>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSaving ? 'Enregistrement...' : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
