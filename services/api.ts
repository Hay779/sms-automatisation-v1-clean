
import { Settings, SmsLog, LogStatus, Company, CompanyStats, UserRole, SystemConfig, FormBlock, FormSubmission } from '../types';

const STORAGE_KEY_DB = 'sms_manager_db_v20'; // Version bumped
const STORAGE_KEY_SYS = 'sms_manager_sys_config_v3';

// --- MOCK DATABASE STRUCTURE ---
interface Database {
  companies: Company[];
  logs: SmsLog[];
  submissions: FormSubmission[];
}

const defaultBlocks: FormBlock[] = [
    { id: 'b0', type: 'paragraph', label: 'Envoyez-nous une photo de la pièce défectueuse pour gagner du temps.', required: false },
    { id: 'contact_1', type: 'contact_info', label: 'Vos Coordonnées', required: true },
    { id: 'b1', type: 'header', label: 'Votre Demande', required: false },
    { id: 'b2', type: 'textarea', label: 'Description du problème', required: true, placeholder: 'Détaillez ici...' },
    { id: 'b3', type: 'photo', label: 'Ajouter une photo', required: false },
    { id: 'b4', type: 'separator', label: '', required: false },
    { id: 'b5', type: 'checkbox', label: 'Est-ce une urgence ?', required: false },
    { id: 'legal_1', type: 'checkbox', label: 'J\'accepte que mes données soient traitées pour cette demande (RGPD)', required: true }
];

const defaultSettings: Settings = {
  company_name: "Nouveau Client",
  company_tagline: "Service Client",
  sms_sender_id: "INFO",
  auto_sms_enabled: true,
  sms_message: "Bonjour, {{company}} a reçu votre appel. Cliquez ici pour qualifier votre demande : {{form_link}}",
  cooldown_seconds: 180,
  sms_credits: 10,
  
  // Default Web Form Config
  web_form: {
      enabled: true,
      logo_url: "https://via.placeholder.com/150",
      page_title: "Qualification de demande",
      company_address: "123 Rue de l'Exemple, 75000 Paris",
      company_phone: "01 23 45 67 89",
      blocks: defaultBlocks,
      enable_marketing: true,
      marketing_text: "Je souhaite recevoir des offres exclusives et promotions.",
      custom_options: [],
      
      // Notifications defaults with Templates
      notify_admin_email: true,
      admin_notification_email: "",
      admin_email_subject: "Nouveau dossier {{ticket}}",
      admin_email_body: "Bonjour,\n\nUn nouveau dossier a été soumis par {{client_phone}} (Ticket: {{ticket}}).\n\nConnectez-vous au dashboard pour voir les photos et détails.",
      
      notify_admin_sms: false,
      admin_notification_phone: "",
      admin_sms_message: "Alerte: Nouveau dossier {{ticket}} reçu de {{client_phone}}.",

      notify_client_email: true,
      client_email_subject: "Confirmation de votre dossier {{ticket}}",
      client_email_body: "Bonjour,\n\nNous avons bien reçu votre demande.\nVotre numéro de suivi est : {{ticket}}.\n\nNous revenons vers vous rapidement.\n\nCordialement,\n{{company}}",
      
      notify_client_sms: false,
      client_sms_message: "Merci. Dossier {{ticket}} bien reçu. Nous vous recontactons vite. {{company}}"
  },

  active_schedule: {
    enabled: false,
    days: [1, 2, 3, 4, 5], // Mon-Fri
    start_time: "09:00",
    end_time: "18:00"
  },
  admin_email: "client@pro.com",
  admin_password: "admin",
  // Custom Provider defaults
  use_custom_provider: false,
  custom_provider_type: 'ovh',
  ovh_app_key: '',
  ovh_app_secret: '',
  ovh_consumer_key: '',
  ovh_service_name: '',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_from_number: '',
  capitole_api_key: ''
};

const defaultSystemConfig: SystemConfig = {
  active_global_provider: 'ovh',
  ovh_app_key: '',
  ovh_app_secret: '',
  ovh_consumer_key: '',
  ovh_service_name: '',
  twilio_account_sid: '',
  twilio_auth_token: '',
  twilio_from_number: '',
  capitole_api_key: '',
  supabase_url: 'https://votre-projet.supabase.co',
  supabase_anon_key: ''
};

const initialDB: Database = {
  companies: [
    {
      id: 'comp_1',
      name: 'ATELIER EXPRESS PRO',
      email: 'admin@atelier.pro',
      status: 'active',
      subscription_plan: 'pro',
      siret: '123 456 789 00012',
      vat_number: 'FR12123456789',
      address: 'Zone Industrielle Nord, 69000 Lyon',
      phone: '04 78 00 00 00',
      contact_name: 'Ariel Directeur',
      notes: 'Client historique, remise 10% sur les SMS.',
      created_at: new Date().toISOString(),
      credit_history: [
          { id: 'txn_1', date: new Date(Date.now() - 86400000 * 30).toISOString(), amount_credits: 100, amount_paid: 10, reference: 'START-BONUS', type: 'credit' },
          { id: 'txn_2', date: new Date(Date.now() - 86400000 * 5).toISOString(), amount_credits: 50, amount_paid: 5, reference: 'INV-2024-001', type: 'credit' }
      ],
      settings: { 
        ...defaultSettings, 
        company_name: "ATELIER EXPRESS", 
        sms_sender_id: "ATELIER PRO",
        admin_email: "admin@atelier.pro",
        sms_credits: 150,
        active_schedule: { enabled: true, days: [1,2,3,4,5], start_time: "08:00", end_time: "19:00" },
        web_form: {
            ...defaultSettings.web_form,
            logo_url: "https://cdn-icons-png.flaticon.com/512/1995/1995470.png",
            page_title: "Pré-diagnostic Atelier",
            company_address: "Zone Industrielle Nord, 69000 Lyon",
            company_phone: "04 78 00 00 00",
            marketing_text: "J'accepte de recevoir des promotions sur l'entretien de mon véhicule.",
            blocks: [
                { id: '0', type: 'paragraph', label: 'Envoyez-nous une photo de la pièce défectueuse pour gagner du temps.', required: false },
                { id: 'contact_demo', type: 'contact_info', label: 'Vos informations', required: true },
                { id: '1', type: 'header', label: 'Le Véhicule', required: false },
                { id: '2', type: 'text', label: 'Immatriculation', required: true, placeholder: 'AB-123-CD' },
                { id: '3', type: 'checkbox', label: 'Véhicule sous garantie ?', required: false },
                { id: '4', type: 'separator', label: '', required: false },
                { id: '5', type: 'header', label: 'La Panne', required: false },
                { id: '6', type: 'photo', label: 'Photo du problème', required: true },
                { id: '7', type: 'video', label: 'Vidéo du bruit (optionnel)', required: false },
                { id: '8', type: 'textarea', label: 'Description détaillée', required: false },
                { id: 'legal_1', type: 'checkbox', label: 'J\'accepte le traitement de mes données.', required: true }
            ],
            enable_marketing: true,
            notify_admin_email: true,
            admin_notification_email: "atelier@contact.com",
            notify_admin_sms: false,
            admin_notification_phone: "",
            notify_client_email: true,
            notify_client_sms: false
        }
      }
    },
    {
      id: 'comp_2',
      name: 'PIZZA LUIGI',
      email: 'luigi@pizza.com',
      status: 'active',
      subscription_plan: 'basic',
      siret: '987 654 321 00045',
      address: '12 Place d\'Italie, 75013 Paris',
      contact_name: 'Luigi Pizzaiolo',
      created_at: new Date().toISOString(),
      credit_history: [],
      settings: { 
        ...defaultSettings, 
        company_name: "CHEZ LUIGI", 
        sms_sender_id: "PIZZALUIGI",
        admin_email: "luigi@pizza.com", 
        sms_message: "Ciao! Luigi est au fourneau. Commandez au...",
        sms_credits: 5,
        web_form: {
            ...defaultSettings.web_form,
            enabled: false
        }
      }
    }
  ],
  logs: [
    { id: 101, company_id: 'comp_1', phone: "+33612345678", message: "Bonjour...", status: LogStatus.SENT, reason: "mobile_ok", call_id: "c1", created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: 102, company_id: 'comp_1', phone: "+33140404040", message: "", status: LogStatus.FILTERED, reason: "is_landline", call_id: "c2", created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: 201, company_id: 'comp_2', phone: "+33699887766", message: "Ciao!...", status: LogStatus.SENT, reason: "mobile_ok", call_id: "c3", created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
  ],
  submissions: []
};

// --- STATE MANAGEMENT ---
let db: Database = initialDB;
let systemConfig: SystemConfig = defaultSystemConfig;
let currentSession: { role: UserRole; companyId: string | null } | null = null;

const loadDB = () => {
  try {
    const storedDB = localStorage.getItem(STORAGE_KEY_DB);
    if (storedDB) db = JSON.parse(storedDB);

    const storedSys = localStorage.getItem(STORAGE_KEY_SYS);
    if (storedSys) systemConfig = JSON.parse(storedSys);
  } catch {
    db = initialDB;
  }
};
loadDB();

const saveDB = () => {
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(db));
};

const saveSys = () => {
  localStorage.setItem(STORAGE_KEY_SYS, JSON.stringify(systemConfig));
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper for template replacement
const replaceVariables = (template: string, vars: Record<string, string>) => {
    let result = template || "";
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
};

// --- MOCK BACKEND LOGIC (Replacing n8n) ---
const sendSmsViaProvider = async (provider: string, phone: string, message: string, keys: any) => {
    console.log(`[BACKEND] Sending SMS via ${provider.toUpperCase()} to ${phone}`);
    // In real Next.js, this would trigger fetch() to OVH/Twilio API
    return true;
};

const sendEmailViaProvider = async (to: string, subject: string, body: string) => {
    console.log(`[BACKEND] Sending Email via Resend to ${to}`);
    // In real Next.js, this would trigger Resend API
    return true;
};


export const ApiService = {
  // --- AUTH ---
  login: async (email: string, pass: string): Promise<{ success: boolean; role?: UserRole; companyId?: string; message?: string }> => {
    await delay(600);
    
    // Super Admin Hardcoded
    if (email === 'master@agence.com' && pass === 'master') {
      currentSession = { role: 'SUPER_ADMIN', companyId: null };
      return { success: true, role: 'SUPER_ADMIN' };
    }

    // Check Companies
    const company = db.companies.find(c => c.settings.admin_email === email && c.settings.admin_password === pass);
    if (company) {
      if (company.status === 'pending_verification') {
          return { success: false, message: "Compte non activé. Vérifiez votre email." }; 
      }
      if (company.status === 'inactive') {
          return { success: false, message: "Compte désactivé." }; 
      }
      currentSession = { role: 'CLIENT', companyId: company.id };
      return { success: true, role: 'CLIENT', companyId: company.id };
    }

    return { success: false, message: "Identifiants incorrects." };
  },
  
  register: async (companyName: string, email: string, password: string): Promise<{ success: boolean; companyId?: string; message?: string; requireVerification?: boolean; debugCode?: string }> => {
    await delay(800);
    
    if (db.companies.find(c => c.email === email)) {
        return { success: false, message: "Cet email est déjà utilisé." };
    }

    const senderId = companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6 digit code

    const newComp: Company = {
      id: `comp_${Date.now()}`,
      name: companyName,
      email: email,
      status: 'pending_verification', // Start as pending
      verification_code: verificationCode,
      subscription_plan: 'basic', // Default plan for self-registration
      created_at: new Date().toISOString(),
      credit_history: [],
      settings: { 
        ...defaultSettings, 
        company_name: companyName, 
        sms_sender_id: senderId,
        admin_email: email,
        admin_password: password,
        sms_credits: 10 // Welcome bonus
      }
    };
    
    db.companies.push(newComp);
    saveDB();

    console.log(`[MOCK EMAIL] Verification code for ${email}: ${verificationCode}`);

    // Do NOT log in immediately. Return verification required.
    return { success: true, requireVerification: true, debugCode: verificationCode };
  },

  verifyEmail: async (email: string, code: string): Promise<{ success: boolean; companyId?: string; message?: string }> => {
      await delay(600);
      const company = db.companies.find(c => c.email === email);
      
      if (!company) return { success: false, message: "Compte introuvable." };
      
      if (company.status !== 'pending_verification') {
          return { success: true, companyId: company.id }; // Already active
      }

      if (company.verification_code === code) {
          company.status = 'active';
          company.verification_code = undefined; // Clear code
          saveDB();
          
          // Log in the user
          currentSession = { role: 'CLIENT', companyId: company.id };
          return { success: true, companyId: company.id };
      } else {
          return { success: false, message: "Code incorrect." };
      }
  },

  resendVerificationCode: async (email: string) => {
      await delay(400);
      const company = db.companies.find(c => c.email === email);
      if (company && company.status === 'pending_verification') {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          company.verification_code = newCode;
          saveDB();
          console.log(`[MOCK EMAIL] New verification code for ${email}: ${newCode}`);
          return newCode;
      }
      return null;
  },

  // --- CLIENT METHODS ---
  getSettings: async (): Promise<Settings> => {
    await delay(300);
    if (!currentSession?.companyId) throw new Error("No session");
    const comp = db.companies.find(c => c.id === currentSession?.companyId);
    return comp ? comp.settings : defaultSettings;
  },

  updateSettings: async (newSettings: Settings): Promise<Settings> => {
    await delay(500);
    if (!currentSession?.companyId) throw new Error("No session");
    
    const index = db.companies.findIndex(c => c.id === currentSession?.companyId);
    if (index !== -1) {
      db.companies[index].settings = newSettings;
      saveDB();
      return newSettings;
    }
    throw new Error("Company not found");
  },

  getLogs: async (): Promise<SmsLog[]> => {
    await delay(400);
    if (!currentSession?.companyId) return [];
    
    // Mark logs that have submissions
    const compLogs = db.logs.filter(l => l.company_id === currentSession?.companyId);
    const submissions = db.submissions.filter(s => s.company_id === currentSession?.companyId);
    
    return compLogs
      .map(log => ({
          ...log,
          has_submission: submissions.some(s => s.phone === log.phone)
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getStats: async () => {
    const logs = await ApiService.getLogs();
    return {
      sms_sent: logs.filter(l => l.status === LogStatus.SENT).length,
      calls_filtered: logs.filter(l => l.status === LogStatus.FILTERED).length,
      errors: logs.filter(l => l.status === LogStatus.ERROR).length
    };
  },

  simulateIncomingCall: async (): Promise<void> => {
    // This function simulates the Next.js API Route (/api/webhooks/incoming-call)
    // It replaces what n8n would have done.
    
    if (!currentSession?.companyId) return;
    const compIndex = db.companies.findIndex(c => c.id === currentSession?.companyId);
    if (compIndex === -1) return;

    const comp = db.companies[compIndex];
    const settings = comp.settings;

    const phone = Math.random() > 0.3 ? `+336${Math.floor(Math.random()*100000000)}` : `+331${Math.floor(Math.random()*100000000)}`;
    const isMobile = phone.startsWith('+336') || phone.startsWith('+337');
    
    let status = LogStatus.SENT;
    let reason = "mobile_ok";

    // 1. Check Landline
    if (!isMobile) { 
        status = LogStatus.FILTERED; 
        reason = "is_landline"; 
    }
    // 2. Check System Disabled
    else if (!settings.auto_sms_enabled) { 
        status = LogStatus.FILTERED; 
        reason = "system_disabled"; 
    }
    // 3. Check Schedule (Opening Hours)
    else if (settings.active_schedule.enabled) {
        const now = new Date();
        const currentDay = now.getDay(); // 0-6
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        if (!settings.active_schedule.days.includes(currentDay)) {
             status = LogStatus.FILTERED;
             reason = "outside_schedule_day";
        } else if (currentTime < settings.active_schedule.start_time || currentTime > settings.active_schedule.end_time) {
             status = LogStatus.FILTERED;
             reason = "outside_schedule_time";
        }
    }

    // 4. Check Credits (Agency Mode ONLY)
    if (status === LogStatus.SENT && !settings.use_custom_provider) {
        if (settings.sms_credits <= 0) {
            status = LogStatus.FILTERED;
            reason = "insufficient_credits";
        }
    }
    
    const formLink = settings.web_form.enabled ? `https://votre-app.com/f/${comp.id}` : '';
    const messageBody = status === LogStatus.SENT 
        ? settings.sms_message
            .replace('{{company}}', settings.company_name)
            .replace('{{form_link}}', formLink)
        : "";

    // 5. EXECUTE SENDING (The Logic that replaces n8n)
    if (status === LogStatus.SENT) {
        // Determine Provider
        const providerType = settings.use_custom_provider 
            ? settings.custom_provider_type 
            : systemConfig.active_global_provider;
            
        // In real app, we would load keys here
        const keys = {}; 
        
        await sendSmsViaProvider(providerType, phone, messageBody, keys);
        
        // Deduct Credit if Agency Mode
        if (!settings.use_custom_provider) {
            db.companies[compIndex].settings.sms_credits -= 1;
        }
    }

    const newLog: SmsLog = {
      id: Date.now(),
      company_id: comp.id,
      phone,
      message: messageBody,
      status,
      reason,
      call_id: `sim_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    db.logs.unshift(newLog);
    if (db.logs.length > 500) db.logs.pop(); 
    saveDB();
  },

  // --- FORM SUBMISSIONS METHODS ---
  submitForm: async (companyId: string, answers: any[], marketingOptin: boolean) => {
      await delay(800);
      
      const comp = db.companies.find(c => c.id === companyId);
      const ticketNumber = `#REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const clientPhone = `+336${Math.floor(Math.random()*100000000)}`; 

      const submission: FormSubmission = {
          id: `sub_${Date.now()}`,
          ticket_number: ticketNumber,
          company_id: companyId,
          phone: clientPhone,
          created_at: new Date().toISOString(),
          answers: answers,
          marketing_optin: marketingOptin,
          status: 'new'
      };
      db.submissions.unshift(submission);
      saveDB();

      // SEND NOTIFICATIONS (Backend Logic)
      if (comp) {
          const config = comp.settings.web_form;
          const vars = {
              ticket: ticketNumber,
              client_phone: clientPhone,
              company: comp.settings.company_name,
              date: new Date().toLocaleDateString()
          };
          
          console.log(`[BACKEND] Notification Job Started for ${ticketNumber}`);
          
          // ADMIN NOTIFICATIONS
          if (config.notify_admin_email && config.admin_notification_email) {
              const subject = replaceVariables(config.admin_email_subject || "Nouveau dossier {{ticket}}", vars);
              const body = replaceVariables(config.admin_email_body || "Dossier reçu.", vars);
              await sendEmailViaProvider(config.admin_notification_email, subject, body);
          }
          if (config.notify_admin_sms && config.admin_notification_phone) {
              const msg = replaceVariables(config.admin_sms_message || "Dossier {{ticket}} reçu.", vars);
              // Send Admin SMS logic here
              console.log(`[BACKEND] Sending Admin SMS to ${config.admin_notification_phone}`);
          }
          
          // CLIENT NOTIFICATIONS
           if (config.notify_client_email) {
              const emailAns = answers.find((a: any) => a.value && a.value.email);
              if (emailAns) {
                   const subject = replaceVariables(config.client_email_subject || "Confirmation {{ticket}}", vars);
                   const body = replaceVariables(config.client_email_body || "Merci.", vars);
                   await sendEmailViaProvider(emailAns.value.email, subject, body);
              }
          }
          if (config.notify_client_sms) {
              const msg = replaceVariables(config.client_sms_message || "Merci for {{ticket}}", vars);
              // Send Client SMS logic here
              console.log(`[BACKEND] Sending Client SMS to ${clientPhone}`);
          }
      }

      return { ticketNumber };
  },

  updateSubmissionStatus: async (id: string, status: 'new' | 'pending' | 'done' | 'archived') => {
      await delay(200);
      const idx = db.submissions.findIndex(s => s.id === id);
      if (idx !== -1) {
          db.submissions[idx].status = status;
          saveDB();
      }
  },

  getFormSubmissions: async (): Promise<FormSubmission[]> => {
      await delay(300);
      if (!currentSession?.companyId) return [];
      return db.submissions
        .filter(s => s.company_id === currentSession?.companyId)
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  // --- SUPER ADMIN METHODS ---
  getAllCompaniesStats: async (): Promise<CompanyStats[]> => {
    await delay(500);
    return db.companies.map(comp => {
      const compLogs = db.logs.filter(l => l.company_id === comp.id);
      const lastLog = compLogs.length > 0 ? compLogs.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;
      
      return {
        company_id: comp.id,
        company_name: comp.name,
        email: comp.email,
        subscription_plan: comp.subscription_plan,
        sms_credits: comp.settings.sms_credits,
        use_custom_provider: comp.settings.use_custom_provider,
        sms_sent: compLogs.filter(l => l.status === LogStatus.SENT).length,
        calls_filtered: compLogs.filter(l => l.status === LogStatus.FILTERED).length,
        errors: compLogs.filter(l => l.status === LogStatus.ERROR).length,
        last_activity: lastLog ? lastLog.created_at : null
      };
    });
  },

  getCompanyDetails: async (companyId: string): Promise<Company | undefined> => {
      return db.companies.find(c => c.id === companyId);
  },

  addCredits: async (companyId: string, amount: number, amountPaid: number, reference: string) => {
      await delay(300);
      const index = db.companies.findIndex(c => c.id === companyId);
      if (index !== -1) {
          // Add credits
          db.companies[index].settings.sms_credits += amount;
          
          // Add history
          if(!db.companies[index].credit_history) db.companies[index].credit_history = [];
          db.companies[index].credit_history.unshift({
              id: `txn_${Date.now()}`,
              date: new Date().toISOString(),
              amount_credits: amount,
              amount_paid: amountPaid,
              reference: reference || 'MANUAL_ADD',
              type: 'credit'
          });

          saveDB();
      }
  },

  getSystemConfig: async (): Promise<SystemConfig> => {
    await delay(200);
    return systemConfig;
  },

  saveSystemConfig: async (config: SystemConfig): Promise<SystemConfig> => {
    await delay(500);
    systemConfig = config;
    saveSys();
    return config;
  },

  impersonateCompany: async (companyId: string) => {
    currentSession = { role: 'SUPER_ADMIN', companyId };
  },

  exitImpersonation: async () => {
    currentSession = { role: 'SUPER_ADMIN', companyId: null };
  },

  createCompany: async (details: { name: string; email: string; plan: 'basic' | 'pro'; siret?: string; vat_number?: string; address?: string; phone?: string; contact_name?: string; notes?: string; password?: string }, initialCredits: number = 10) => {
    await delay(500);
    
    const senderId = details.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();

    const newComp: Company = {
      id: `comp_${Date.now()}`,
      name: details.name,
      email: details.email,
      status: 'active',
      subscription_plan: details.plan,
      
      siret: details.siret,
      vat_number: details.vat_number,
      address: details.address,
      phone: details.phone,
      contact_name: details.contact_name,
      notes: details.notes,

      created_at: new Date().toISOString(),
      credit_history: [],
      settings: { 
        ...defaultSettings, 
        company_name: details.name, 
        sms_sender_id: senderId,
        admin_email: details.email,
        admin_password: details.password || 'admin',
        sms_credits: initialCredits
      }
    };
    db.companies.push(newComp);
    saveDB();
  },

  deleteCompany: async (id: string) => {
    await delay(500);
    db.companies = db.companies.filter(c => c.id !== id);
    db.logs = db.logs.filter(l => l.company_id !== id);
    db.submissions = db.submissions.filter(s => s.company_id !== id);
    saveDB();
  },

  resetAllData: async () => {
      await delay(500);
      db = initialDB;
      saveDB();
  }
};
