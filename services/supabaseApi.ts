import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Settings, SmsLog, LogStatus, Company, CompanyStats, 
  UserRole, SystemConfig, FormBlock, FormSubmission 
} from '../types';

// --- HYBRID ENV VARS SUPPORT (VITE + NEXT.JS) ---
// Version 1.1 - Force Deploy Trigger
const getEnv = (key: string) => {
    try {
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env[key.replace('NEXT_PUBLIC_', 'VITE_')]) {
            // @ts-ignore
            return import.meta.env[key.replace('NEXT_PUBLIC_', 'VITE_')];
        }
    } catch (e) {}

    try {
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {}

    return '';
};

// --- LAZY SINGLETON PATTERN ---
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
    const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
        console.warn("Supabase keys missing. Using dummy client.");
        return {
            from: () => ({
                select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Configuration Supabase manquante (Clés API)" } }) }) }),
                insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Configuration Supabase manquante (Clés API)" } }) }) }),
                update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Configuration Supabase manquante (Clés API)" } }) }) }) }),
                delete: () => ({ eq: () => Promise.resolve({ error: { message: "Configuration Supabase manquante (Clés API)" } }) }),
                upsert: () => Promise.resolve({ error: { message: "Configuration Supabase manquante" } })
            })
        } as any;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
};

export const ApiService = {
  
  // --- AUTHENTIFICATION ---
  
  login: async (email: string, pass: string) => {
    const supabase = getSupabase();
    console.log(`[LOGIN DEBUG] Attempting login for ${email}`);

    // 1. Check ADMINS table
    try {
        const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

        if (adminError && adminError.code !== 'PGRST116') {
            console.error("[LOGIN DEBUG] Admin query error:", adminError);
        }

        if (admin) {
            console.log("[LOGIN DEBUG] Admin found. Checking password...");
            // In production, compare hashed passwords. For V1, simple comparison.
            if (admin.password_hash === pass) {
                console.log("[LOGIN DEBUG] Admin password match!");
                return { success: true, role: 'SUPER_ADMIN' as UserRole };
            } else {
                console.log("[LOGIN DEBUG] Admin password MISMATCH.");
                // CAUTION: Remove this log in production or don't log the actual passwords
                console.log(`Expected: ${admin.password_hash}, Received: ${pass}`);
                return { success: false, message: "Mot de passe administrateur incorrect." };
            }
        } else {
            console.log("[LOGIN DEBUG] No admin found with this email.");
        }
    } catch (err) {
        console.error("[LOGIN DEBUG] Unexpected error in admin check:", err);
    }

    // 2. Check CLIENTS (Companies)
    console.log("[LOGIN DEBUG] Checking companies table...");
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !company) {
        console.log("[LOGIN DEBUG] Company query failed or empty:", error);
        return { success: false, message: "Identifiants incorrects." };
    }
    
    if (company.password_hash !== pass) return { success: false, message: "Mot de passe incorrect." };

    if (company.status === 'pending_verification') {
        return { success: false, message: "Compte non activé. Vérifiez votre email." }; 
    }
    if (company.status === 'inactive') {
        return { success: false, message: "Compte désactivé." }; 
    }

    return { success: true, role: 'CLIENT' as UserRole, companyId: company.id };
  },

  register: async (companyName: string, email: string, password: string) => {
    const supabase = getSupabase();
    // Check companies
    const { data: existing } = await supabase.from('companies').select('id').eq('email', email).single();
    if (existing) return { success: false, message: "Email déjà utilisé." };
    
    // Check admins prevents registering as an admin email
    const { data: existingAdmin } = await supabase.from('admins').select('id').eq('email', email).single();
    if (existingAdmin) return { success: false, message: "Cet email est réservé." };

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const senderId = companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();

    const { data: newComp, error } = await supabase.from('companies').insert([{
        name: companyName,
        email: email,
        password_hash: password,
        status: 'pending_verification',
        verification_code: verificationCode,
        subscription_plan: 'basic',
        credit_history: []
    }]).select().single();

    if (error) return { success: false, message: error.message };

    // Default Web Form
    const defaultWebForm = {
        enabled: true,
        logo_url: "",
        page_title: "Contact",
        company_address: "",
        company_phone: "",
        blocks: [
            { id: 'contact_1', type: 'contact_info', label: 'Vos Coordonnées', required: true },
            { id: 'b2', type: 'textarea', label: 'Description', required: true, placeholder: 'Détails...' },
            { id: 'b3', type: 'photo', label: 'Photo', required: false },
            { id: 'legal_1', type: 'checkbox', label: 'J\'accepte le traitement de mes données (RGPD)', required: true }
        ],
        enable_marketing: false,
        marketing_text: "Je souhaite recevoir des offres.",
        custom_options: [],
        notify_admin_email: true,
        admin_notification_email: email,
        notify_admin_sms: false,
        notify_client_email: false,
        notify_client_sms: false
    };

    await supabase.from('settings').insert([{
        company_id: newComp.id,
        company_name: companyName,
        sms_sender_id: senderId,
        admin_email: email,
        sms_credits: 10,
        auto_sms_enabled: true,
        sms_message: "Bonjour, {{company}} a reçu votre appel. Cliquez ici : {{form_link}}",
        cooldown_seconds: 180,
        web_form: defaultWebForm,
        active_schedule: { enabled: false, days: [], start_time: "09:00", end_time: "18:00" }
    }]);

    return { success: true, requireVerification: true, debugCode: verificationCode };
  },

  verifyEmail: async (email: string, code: string) => {
      const supabase = getSupabase();
      const { data: company } = await supabase.from('companies').select('*').eq('email', email).single();
      
      if (!company) return { success: false, message: "Compte introuvable." };
      if (company.verification_code !== code) return { success: false, message: "Code invalide." };

      await supabase.from('companies').update({ status: 'active', verification_code: null }).eq('id', company.id);
      return { success: true, companyId: company.id };
  },
  
  resendVerificationCode: async (email: string) => {
      const supabase = getSupabase();
      const { data: company } = await supabase.from('companies').select('*').eq('email', email).single();
      if (company && company.status === 'pending_verification') {
          const newCode = Math.floor(100000 + Math.random() * 900000).toString();
          await supabase.from('companies').update({ verification_code: newCode }).eq('id', company.id);
          return newCode;
      }
      return null;
  },

  // --- DATA ACCESS ---

  getSettings: async (companyId?: string) => {
      if (!companyId) return null; 
      const supabase = getSupabase();
      const { data } = await supabase.from('settings').select('*').eq('company_id', companyId).single();
      return data;
  },

  updateSettings: async (newSettings: Settings) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('settings')
        .update(newSettings)
        .eq('admin_email', newSettings.admin_email) 
        .select()
        .single();
      
      if (error) throw error;
      return data;
  },

  getLogs: async (companyId?: string) => {
      if (!companyId) return [];
      const supabase = getSupabase();
      const { data } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);
      return data || [];
  },

  getStats: async (companyId?: string) => {
      if (!companyId) return { sms_sent: 0, calls_filtered: 0, errors: 0 };
      const supabase = getSupabase();
      
      const { count: sent } = await supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'sent');
      const { count: filtered } = await supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'filtered');
      const { count: error } = await supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'error');
      
      return { sms_sent: sent || 0, calls_filtered: filtered || 0, errors: error || 0 };
  },

  // --- CRM ---

  submitForm: async (companyId: string, answers: any[], marketingOptin: boolean) => {
      const supabase = getSupabase();
      const ticketNumber = `#REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await supabase.from('form_submissions').insert([{
          company_id: companyId,
          ticket_number: ticketNumber,
          answers: answers,
          marketing_optin: marketingOptin,
          status: 'new'
      }]);

      return { ticketNumber };
  },

  getSubmissions: async (companyId?: string) => {
      if (!companyId) return [];
      const supabase = getSupabase();
      const { data } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      return data || [];
  },

  updateSubmissionStatus: async (id: string, status: string) => {
      const supabase = getSupabase();
      await supabase.from('form_submissions').update({ status }).eq('id', id);
  },

  // --- SUPER ADMIN ---
  
  getAllCompaniesStats: async () => {
      const supabase = getSupabase();
      const { data: companies } = await supabase.from('companies').select('*');
      if (!companies) return [];

      const stats = await Promise.all(companies.map(async (comp) => {
          const { count: sent } = await supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('company_id', comp.id).eq('status', 'sent');
          const { data: setting } = await supabase.from('settings').select('sms_credits, use_custom_provider').eq('company_id', comp.id).single();

          return {
              company_id: comp.id,
              company_name: comp.name,
              email: comp.email,
              subscription_plan: comp.subscription_plan,
              sms_credits: setting?.sms_credits || 0,
              use_custom_provider: setting?.use_custom_provider || false,
              sms_sent: sent || 0,
              calls_filtered: 0,
              errors: 0,
              last_activity: comp.created_at
          };
      }));
      return stats;
  },
  
  getSystemConfig: async () => {
      const supabase = getSupabase();
      const { data } = await supabase.from('system_config').select('*').single();
      return data || {
          active_global_provider: 'ovh',
          ovh_app_key: '', ovh_app_secret: '', ovh_consumer_key: '', ovh_service_name: '',
          twilio_account_sid: '', twilio_auth_token: '', twilio_from_number: '',
          capitole_api_key: '',
          supabase_url: '', supabase_anon_key: ''
      };
  },

  saveSystemConfig: async (config: SystemConfig) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('system_config').upsert({ id: 1, ...config });
      if (error) throw error;
      return config;
  },

  createCompany: async (details: any, initialCredits: number = 10) => {
      const supabase = getSupabase();
      const senderId = details.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();
      
      const { data: newComp, error } = await supabase.from('companies').insert([{
        name: details.name,
        email: details.email,
        password_hash: details.password, 
        status: 'active',
        subscription_plan: details.plan,
        siret: details.siret,
        vat_number: details.vat_number,
        address: details.address,
        phone: details.phone,
        contact_name: details.contact_name,
        notes: details.notes,
        credit_history: []
      }]).select().single();

      if (error) throw error;

      await supabase.from('settings').insert([{
        company_id: newComp.id,
        company_name: details.name,
        sms_sender_id: senderId,
        admin_email: details.email,
        sms_credits: initialCredits,
        auto_sms_enabled: true,
        sms_message: "Bonjour, {{company}} a reçu votre appel.",
        cooldown_seconds: 180,
        web_form: { enabled: true, blocks: [] }
      }]);
  },

  deleteCompany: async (id: string) => {
      const supabase = getSupabase();
      await supabase.from('companies').delete().eq('id', id);
  },
  
  addCredits: async (companyId: string, amount: number, amountPaid: number, reference: string) => {
      const supabase = getSupabase();
      const { data: setting } = await supabase.from('settings').select('sms_credits').eq('company_id', companyId).single();
      const newCredits = (setting?.sms_credits || 0) + amount;
      await supabase.from('settings').update({ sms_credits: newCredits }).eq('company_id', companyId);
      
      const { data: comp } = await supabase.from('companies').select('credit_history').eq('id', companyId).single();
      const history = comp?.credit_history || [];
      history.unshift({
          id: `txn_${Date.now()}`,
          date: new Date().toISOString(),
          amount_credits: amount,
          amount_paid: amountPaid,
          reference: reference,
          type: 'credit'
      });
      await supabase.from('companies').update({ credit_history: history }).eq('id', companyId);
  },
  
  getCompanyDetails: async (id: string) => {
      const supabase = getSupabase();
      const { data } = await supabase.from('companies').select('*').eq('id', id).single();
      return data;
  },

  simulateIncomingCall: async () => { console.log("Utilisez le Webhook en production."); },
  impersonateCompany: async (id: string) => { },
  exitImpersonation: async () => { },
  resetAllData: async () => { console.log("Impossible en production."); }
};
