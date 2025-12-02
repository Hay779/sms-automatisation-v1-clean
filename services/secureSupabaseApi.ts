/**
 * Secure Supabase API Service
 * Enhanced version with security, validation, and error handling
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Settings, SmsLog, Company, CompanyStats, 
  UserRole, SystemConfig, FormSubmission 
} from '../types';
import { 
  hashPassword, 
  verifyPassword, 
  validateEmail, 
  validatePassword, 
  validateCompanyName,
  sanitizeHtml,
  sanitizeObject,
  checkRateLimit
} from '../utils/security';

// Environment variables helper
const getEnv = (key: string): string => {
    try {
        // @ts-ignore - Vite environment
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

// Singleton Supabase client
let supabaseInstance: SupabaseClient | null = null;

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL');
    const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Supabase configuration missing!");
        throw new Error("Configuration Supabase manquante. Vérifiez vos variables d'environnement.");
    }

    console.log("✅ Supabase client initialized:", supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
};

/**
 * Enhanced API Service with Security
 */
export const SecureApiService = {
  
  // ============ AUTHENTICATION ============
  
  login: async (email: string, pass: string) => {
    // Rate limiting
    if (!checkRateLimit(`login_${email}`, 5, 60000)) {
      return { success: false, message: "Trop de tentatives. Réessayez dans 1 minute." };
    }

    // Validation
    if (!validateEmail(email)) {
      return { success: false, message: "Format d'email invalide." };
    }

    const supabase = getSupabase();
    console.log(`[LOGIN] Attempting login for ${email}`);

    try {
      // Check ADMINS table
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', email)
        .single();

      if (admin) {
        console.log("[LOGIN] Admin found, verifying password...");
        // For now, simple comparison (will be hashed in next step)
        if (admin.password_hash === pass) {
          console.log("[LOGIN] ✅ Admin login successful");
          return { success: true, role: 'SUPER_ADMIN' as UserRole };
        }
        return { success: false, message: "Mot de passe incorrect." };
      }

      // Check COMPANIES
      const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !company) {
        console.log("[LOGIN] ❌ No user found");
        return { success: false, message: "Identifiants incorrects." };
      }
      
      // Verify password (simple comparison for now)
      if (company.password_hash !== pass) {
        return { success: false, message: "Mot de passe incorrect." };
      }

      // Check account status
      if (company.status === 'pending_verification') {
        return { success: false, message: "Compte non activé. Vérifiez votre email." }; 
      }
      if (company.status === 'inactive') {
        return { success: false, message: "Compte désactivé. Contactez le support." }; 
      }

      console.log("[LOGIN] ✅ Client login successful");
      return { success: true, role: 'CLIENT' as UserRole, companyId: company.id };
    } catch (err) {
      console.error("[LOGIN] Error:", err);
      return { success: false, message: "Erreur de connexion. Réessayez." };
    }
  },

  register: async (companyName: string, email: string, password: string) => {
    // Rate limiting
    if (!checkRateLimit(`register_${email}`, 3, 300000)) {
      return { success: false, message: "Trop de tentatives. Réessayez dans 5 minutes." };
    }

    // Validation
    if (!validateEmail(email)) {
      return { success: false, message: "Format d'email invalide." };
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return { success: false, message: passwordValidation.message };
    }

    const companyValidation = validateCompanyName(companyName);
    if (!companyValidation.valid) {
      return { success: false, message: companyValidation.message };
    }

    const supabase = getSupabase();
    
    try {
      // Check if email exists
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existing) {
        return { success: false, message: "Cet email est déjà utilisé." };
      }
      
      // Check admins table
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .single();
      
      if (existingAdmin) {
        return { success: false, message: "Cet email est réservé." };
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const senderId = companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();

      // Hash password (for now using simple method, will enhance)
      const passwordHash = await hashPassword(password);

      // Create company
      const { data: newComp, error } = await supabase
        .from('companies')
        .insert([{
          name: sanitizeHtml(companyName),
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          status: 'pending_verification',
          verification_code: verificationCode,
          subscription_plan: 'basic',
          credit_history: []
        }])
        .select()
        .single();

      if (error) {
        console.error("[REGISTER] Error:", error);
        return { success: false, message: "Erreur lors de l'inscription: " + error.message };
      }

      // Create default settings
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
        admin_email_subject: "Nouveau dossier {{ticket}}",
        admin_email_body: "Un nouveau dossier a été soumis. Ticket: {{ticket}}",
        notify_admin_sms: false,
        admin_notification_phone: "",
        admin_sms_message: "",
        notify_client_email: false,
        client_email_subject: "",
        client_email_body: "",
        notify_client_sms: false,
        client_sms_message: ""
      };

      await supabase.from('settings').insert([{
        company_id: newComp.id,
        company_name: sanitizeHtml(companyName),
        sms_sender_id: senderId,
        admin_email: email,
        sms_credits: 10,
        auto_sms_enabled: true,
        sms_message: "Bonjour, {{company}} a reçu votre appel. Cliquez ici : {{form_link}}",
        cooldown_seconds: 180,
        web_form: defaultWebForm,
        active_schedule: { enabled: false, days: [], start_time: "09:00", end_time: "18:00" },
        use_custom_provider: false,
        custom_provider_type: 'ovh'
      }]);

      console.log(`[REGISTER] ✅ Account created. Verification code: ${verificationCode}`);
      return { success: true, requireVerification: true, debugCode: verificationCode };
    } catch (err) {
      console.error("[REGISTER] Unexpected error:", err);
      return { success: false, message: "Erreur inattendue. Réessayez." };
    }
  },

  verifyEmail: async (email: string, code: string) => {
    const supabase = getSupabase();
    
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('email', email)
        .single();
      
      if (!company) {
        return { success: false, message: "Compte introuvable." };
      }
      
      if (company.verification_code !== code) {
        return { success: false, message: "Code invalide." };
      }

      await supabase
        .from('companies')
        .update({ status: 'active', verification_code: null })
        .eq('id', company.id);
      
      console.log(`[VERIFY] ✅ Email verified for ${email}`);
      return { success: true, companyId: company.id };
    } catch (err) {
      console.error("[VERIFY] Error:", err);
      return { success: false, message: "Erreur de vérification." };
    }
  },
  
  resendVerificationCode: async (email: string) => {
    const supabase = getSupabase();
    
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('email', email)
        .single();
      
      if (company && company.status === 'pending_verification') {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        await supabase
          .from('companies')
          .update({ verification_code: newCode })
          .eq('id', company.id);
        
        console.log(`[RESEND] New verification code for ${email}: ${newCode}`);
        return newCode;
      }
      return null;
    } catch (err) {
      console.error("[RESEND] Error:", err);
      return null;
    }
  },

  // ============ DATA ACCESS ============

  getSettings: async (companyId?: string) => {
    if (!companyId) return null;
    
    const supabase = getSupabase();
    
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', companyId)
        .single();
      
      if (error) {
        console.error("[GET_SETTINGS] Error:", error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error("[GET_SETTINGS] Unexpected error:", err);
      return null;
    }
  },

  updateSettings: async (companyId: string, newSettings: Settings) => {
    const supabase = getSupabase();
    
    try {
      // Sanitize inputs
      const sanitizedSettings = {
        ...newSettings,
        company_name: sanitizeHtml(newSettings.company_name),
        company_tagline: sanitizeHtml(newSettings.company_tagline),
        sms_message: sanitizeHtml(newSettings.sms_message),
        sms_sender_id: newSettings.sms_sender_id.replace(/[^A-Z0-9]/g, '').substring(0, 11)
      };

      const { data, error } = await supabase
        .from('settings')
        .update(sanitizedSettings)
        .eq('company_id', companyId)
        .select()
        .single();
      
      if (error) throw error;
      
      console.log(`[UPDATE_SETTINGS] ✅ Settings updated for company ${companyId}`);
      return data;
    } catch (err) {
      console.error("[UPDATE_SETTINGS] Error:", err);
      throw err;
    }
  },

  getLogs: async (companyId?: string) => {
    if (!companyId) return [];
    
    const supabase = getSupabase();
    
    try {
      const { data, error } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error("[GET_LOGS] Error:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("[GET_LOGS] Unexpected error:", err);
      return [];
    }
  },

  getStats: async (companyId?: string) => {
    if (!companyId) return { sms_sent: 0, calls_filtered: 0, errors: 0 };
    
    const supabase = getSupabase();
    
    try {
      const { count: sent } = await supabase
        .from('sms_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'sent');
      
      const { count: filtered } = await supabase
        .from('sms_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'filtered');
      
      const { count: error } = await supabase
        .from('sms_logs')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId)
        .eq('status', 'error');
      
      return { 
        sms_sent: sent || 0, 
        calls_filtered: filtered || 0, 
        errors: error || 0 
      };
    } catch (err) {
      console.error("[GET_STATS] Error:", err);
      return { sms_sent: 0, calls_filtered: 0, errors: 0 };
    }
  },

  // ============ FORM SUBMISSIONS ============

  submitForm: async (companyId: string, answers: any[], marketingOptin: boolean) => {
    const supabase = getSupabase();
    const ticketNumber = `#REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    
    try {
      // Sanitize answers
      const sanitizedAnswers = sanitizeObject(answers);

      const { error } = await supabase
        .from('form_submissions')
        .insert([{
          company_id: companyId,
          ticket_number: ticketNumber,
          answers: sanitizedAnswers,
          marketing_optin: marketingOptin,
          status: 'new',
          phone: `+336${Math.floor(Math.random()*100000000)}`
        }]);

      if (error) throw error;

      console.log(`[SUBMIT_FORM] ✅ Form submitted: ${ticketNumber}`);
      return { ticketNumber };
    } catch (err) {
      console.error("[SUBMIT_FORM] Error:", err);
      throw err;
    }
  },

  getSubmissions: async (companyId?: string) => {
    if (!companyId) return [];
    
    const supabase = getSupabase();
    
    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("[GET_SUBMISSIONS] Error:", error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error("[GET_SUBMISSIONS] Unexpected error:", err);
      return [];
    }
  },

  updateSubmissionStatus: async (id: string, status: string) => {
    const supabase = getSupabase();
    
    try {
      await supabase
        .from('form_submissions')
        .update({ status })
        .eq('id', id);
      
      console.log(`[UPDATE_SUBMISSION] ✅ Status updated to ${status}`);
    } catch (err) {
      console.error("[UPDATE_SUBMISSION] Error:", err);
    }
  },

  // ============ SUPER ADMIN ============
  
  getAllCompaniesStats: async () => {
    const supabase = getSupabase();
    
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*');
      
      if (error || !companies) return [];

      const stats = await Promise.all(companies.map(async (comp) => {
        const { count: sent } = await supabase
          .from('sms_logs')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', comp.id)
          .eq('status', 'sent');
        
        const { data: setting } = await supabase
          .from('settings')
          .select('sms_credits, use_custom_provider')
          .eq('company_id', comp.id)
          .single();

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
    } catch (err) {
      console.error("[GET_ALL_COMPANIES] Error:", err);
      return [];
    }
  },
  
  getSystemConfig: async () => {
    const supabase = getSupabase();
    
    try {
      const { data } = await supabase
        .from('system_config')
        .select('*')
        .single();
      
      return data || {
        active_global_provider: 'ovh',
        ovh_app_key: '', ovh_app_secret: '', ovh_consumer_key: '', ovh_service_name: '',
        twilio_account_sid: '', twilio_auth_token: '', twilio_from_number: '',
        capitole_api_key: '',
        supabase_url: '', supabase_anon_key: ''
      };
    } catch (err) {
      console.error("[GET_SYSTEM_CONFIG] Error:", err);
      return {};
    }
  },

  saveSystemConfig: async (config: SystemConfig) => {
    const supabase = getSupabase();
    
    try {
      const { data, error } = await supabase
        .from('system_config')
        .upsert({ id: 1, ...config });
      
      if (error) throw error;
      
      console.log("[SAVE_SYSTEM_CONFIG] ✅ Config saved");
      return config;
    } catch (err) {
      console.error("[SAVE_SYSTEM_CONFIG] Error:", err);
      throw err;
    }
  },

  createCompany: async (details: any, initialCredits: number = 10) => {
    const supabase = getSupabase();
    const senderId = details.name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();
    
    try {
      // Hash password
      const passwordHash = await hashPassword(details.password || 'admin');

      const { data: newComp, error } = await supabase
        .from('companies')
        .insert([{
          name: sanitizeHtml(details.name),
          email: details.email,
          password_hash: passwordHash,
          status: 'active',
          subscription_plan: details.plan,
          siret: details.siret,
          vat_number: details.vat_number,
          address: sanitizeHtml(details.address || ''),
          phone: details.phone,
          contact_name: sanitizeHtml(details.contact_name || ''),
          notes: sanitizeHtml(details.notes || ''),
          credit_history: []
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('settings').insert([{
        company_id: newComp.id,
        company_name: sanitizeHtml(details.name),
        sms_sender_id: senderId,
        admin_email: details.email,
        sms_credits: initialCredits,
        auto_sms_enabled: true,
        sms_message: "Bonjour, {{company}} a reçu votre appel.",
        cooldown_seconds: 180,
        web_form: { enabled: true, blocks: [] }
      }]);
      
      console.log(`[CREATE_COMPANY] ✅ Company created: ${details.name}`);
    } catch (err) {
      console.error("[CREATE_COMPANY] Error:", err);
      throw err;
    }
  },

  deleteCompany: async (id: string) => {
    const supabase = getSupabase();
    
    try {
      await supabase.from('companies').delete().eq('id', id);
      console.log(`[DELETE_COMPANY] ✅ Company deleted: ${id}`);
    } catch (err) {
      console.error("[DELETE_COMPANY] Error:", err);
      throw err;
    }
  },
  
  addCredits: async (companyId: string, amount: number, amountPaid: number, reference: string) => {
    const supabase = getSupabase();
    
    try {
      const { data: setting } = await supabase
        .from('settings')
        .select('sms_credits')
        .eq('company_id', companyId)
        .single();
      
      const newCredits = (setting?.sms_credits || 0) + amount;
      
      await supabase
        .from('settings')
        .update({ sms_credits: newCredits })
        .eq('company_id', companyId);
      
      const { data: comp } = await supabase
        .from('companies')
        .select('credit_history')
        .eq('id', companyId)
        .single();
      
      const history = comp?.credit_history || [];
      history.unshift({
        id: `txn_${Date.now()}`,
        date: new Date().toISOString(),
        amount_credits: amount,
        amount_paid: amountPaid,
        reference: sanitizeHtml(reference),
        type: 'credit'
      });
      
      await supabase
        .from('companies')
        .update({ credit_history: history })
        .eq('id', companyId);
      
      console.log(`[ADD_CREDITS] ✅ ${amount} credits added to company ${companyId}`);
    } catch (err) {
      console.error("[ADD_CREDITS] Error:", err);
      throw err;
    }
  },
  
  getCompanyDetails: async (id: string) => {
    const supabase = getSupabase();
    
    try {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();
      
      return data;
    } catch (err) {
      console.error("[GET_COMPANY_DETAILS] Error:", err);
      return null;
    }
  },

  // Placeholders
  simulateIncomingCall: async () => { 
    console.log("[SIMULATE] Use webhook in production."); 
  },
  impersonateCompany: async (id: string) => { },
  exitImpersonation: async () => { },
  resetAllData: async () => { 
    console.log("[RESET] Impossible in production."); 
  }
};
