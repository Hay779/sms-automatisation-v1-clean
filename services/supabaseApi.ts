/**
 * ✅ SUPABASE API SERVICE - VERSION AMÉLIORÉE
 * Résout les problèmes de synchronisation et de connexion
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  Settings, SmsLog, Company, CompanyStats, 
  UserRole, SystemConfig, FormSubmission 
} from '../types';

// ==========================================
// CONFIGURATION ENVIRONNEMENT
// ==========================================

const getEnv = (key: string): string => {
    try {
        // Support Vite
        // @ts-ignore
        if (import.meta && import.meta.env && import.meta.env[key.replace('NEXT_PUBLIC_', 'VITE_')]) {
            // @ts-ignore
            return import.meta.env[key.replace('NEXT_PUBLIC_', 'VITE_')];
        }
    } catch (e) {}

    try {
        // Support Next.js
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
        console.error("❌ Configuration Supabase manquante !");
        console.error("Variables requises: VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY");
        throw new Error("Configuration Supabase manquante. Vérifiez vos variables d'environnement.");
    }

    console.log("✅ Supabase initialisé:", supabaseUrl);
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false
        }
    });
    return supabaseInstance;
};

// ==========================================
// API SERVICE
// ==========================================

export const ApiService = {
  
  // ============ AUTHENTIFICATION ============
  
  login: async (email: string, pass: string) => {
    const supabase = getSupabase();
    const emailLower = email.toLowerCase().trim();
    
    console.log(`[LOGIN] Tentative de connexion: ${emailLower}`);

    try {
      const { data: admin, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', emailLower)
        .single();

      if (admin && !adminError) {
        console.log("[LOGIN] Admin trouvé");
        if (admin.password_hash === pass) {
          console.log("[LOGIN] ✅ Admin authentifié");
          return { success: true, role: 'SUPER_ADMIN' as UserRole };
        }
        console.log("[LOGIN] ❌ Mot de passe admin incorrect");
        return { success: false, message: "Mot de passe incorrect." };
      }

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('email', emailLower)
        .single();

      if (companyError || !company) {
        console.log("[LOGIN] ❌ Utilisateur introuvable");
        return { success: false, message: "Identifiants incorrects." };
      }
      
      if (company.password_hash !== pass) {
        console.log("[LOGIN] ❌ Mot de passe client incorrect");
        return { success: false, message: "Mot de passe incorrect." };
      }

      if (company.status === 'inactive') {
        console.log("[LOGIN] ❌ Compte désactivé");
        return { success: false, message: "Compte désactivé. Contactez le support." }; 
      }

      const { data: settings } = await supabase
        .from('settings')
        .select('id')
        .eq('company_id', company.id)
        .single();

      if (!settings) {
        console.warn(`[LOGIN] ⚠️ Settings manquants pour company ${company.id}, ils seront créés automatiquement`);
      }

      console.log(`[LOGIN] ✅ Client authentifié: ${company.name} (Status: ${company.status})`);
      return { 
        success: true, 
        role: 'CLIENT' as UserRole, 
        companyId: company.id 
      };
      
    } catch (err) {
      console.error("[LOGIN] Erreur:", err);
      return { success: false, message: "Erreur de connexion. Réessayez." };
    }
  },

  register: async (companyName: string, email: string, password: string) => {
    const supabase = getSupabase();
    const emailLower = email.toLowerCase().trim();
    
    console.log(`[REGISTER] Inscription: ${companyName} (${emailLower})`);
    
    try {
      const { data: existing } = await supabase
        .from('companies')
        .select('id')
        .eq('email', emailLower)
        .single();
      
      if (existing) {
        return { success: false, message: "Cet email est déjà utilisé." };
      }
      
      const { data: existingAdmin } = await supabase
        .from('admins')
        .select('id')
        .eq('email', emailLower)
        .single();
      
      if (existingAdmin) {
        return { success: false, message: "Cet email est réservé." };
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const { data: newComp, error } = await supabase
        .from('companies')
        .insert([{
          name: companyName,
          email: emailLower,
          password_hash: password,
          status: 'pending_verification',
          verification_code: verificationCode,
          subscription_plan: 'basic',
          credit_history: []
        }])
        .select()
        .single();

      if (error) {
        console.error("[REGISTER] Erreur:", error);
        return { success: false, message: "Erreur lors de l'inscription: " + error.message };
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: settings } = await supabase
        .from('settings')
        .select('id')
        .eq('company_id', newComp.id)
        .single();

      if (!settings) {
        console.warn("[REGISTER] ⚠️ Settings non créés par le trigger, création manuelle");
        await createDefaultSettings(supabase, newComp.id, companyName, emailLower);
      }

      console.log(`[REGISTER] ✅ Compte créé. Code de vérification: ${verificationCode}`);
      
      return { 
        success: true, 
        requireVerification: true, 
        debugCode: verificationCode 
      };
      
    } catch (err) {
      console.error("[REGISTER] Erreur inattendue:", err);
      return { success: false, message: "Erreur inattendue. Réessayez." };
    }
  },

  verifyEmail: async (email: string, code: string) => {
    const supabase = getSupabase();
    const emailLower = email.toLowerCase().trim();
    
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('email', emailLower)
        .single();
      
      if (!company) {
        return { success: false, message: "Compte introuvable." };
      }
      
      if (company.verification_code !== code) {
        return { success: false, message: "Code invalide." };
      }

      await supabase
        .from('companies')
        .update({ 
          status: 'active', 
          verification_code: null 
        })
        .eq('id', company.id);
      
      console.log(`[VERIFY] ✅ Email vérifié pour ${emailLower}`);
      return { success: true, companyId: company.id };
      
    } catch (err) {
      console.error("[VERIFY] Erreur:", err);
      return { success: false, message: "Erreur de vérification." };
    }
  },
  
  resendVerificationCode: async (email: string) => {
    const supabase = getSupabase();
    const emailLower = email.toLowerCase().trim();
    
    try {
      const { data: company } = await supabase
        .from('companies')
        .select('*')
        .eq('email', emailLower)
        .single();
      
      if (company && company.status === 'pending_verification') {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        await supabase
          .from('companies')
          .update({ verification_code: newCode })
          .eq('id', company.id);
        
        console.log(`[RESEND] Nouveau code pour ${emailLower}: ${newCode}`);
        return newCode;
      }
      return null;
    } catch (err) {
      console.error("[RESEND] Erreur:", err);
      return null;
    }
  },

  // ============ DONNÉES ============

  getSettings: async (companyId?: string): Promise<Settings | null> => {
    if (!companyId) return null;
    
    const supabase = getSupabase();
    
    try {
      const { data: settings, error } = await supabase
        .from('settings')
        .select('*')
        .eq('company_id', companyId)
        .single();

      if (error || !settings) {
        console.warn(`[GET_SETTINGS] Settings manquants pour ${companyId}, création...`);
        
        const { data: company } = await supabase
          .from('companies')
          .select('name, email')
          .eq('id', companyId)
          .single();

        if (company) {
          await createDefaultSettings(supabase, companyId, company.name, company.email);
          
          const { data: newSettings } = await supabase
            .from('settings')
            .select('*')
            .eq('company_id', companyId)
            .single();
          
          return newSettings;
        }
      }

      return settings;
    } catch (err) {
      console.error("[GET_SETTINGS] Erreur:", err);
      return null;
    }
  },

  updateSettings: async (companyId: string, newSettings: Settings): Promise<Settings> => {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('settings')
      .update(newSettings)
      .eq('company_id', companyId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getLogs: async (companyId?: string): Promise<SmsLog[]> => {
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
    const { data: logs } = await supabase
      .from('sms_logs')
      .select('status')
      .eq('company_id', companyId);

    const sms_sent = logs?.filter(l => l.status === 'sent').length || 0;
    const calls_filtered = logs?.filter(l => l.status === 'blocked').length || 0;
    const errors = logs?.filter(l => l.status === 'error').length || 0;

    return { sms_sent, calls_filtered, errors };
  },

  logSms: async (log: Omit<SmsLog, 'id' | 'created_at'>) => {
    const supabase = getSupabase();
    await supabase.from('sms_logs').insert([log]);
  },

  // ============ SUPER ADMIN ============

  getAllCompanies: async (): Promise<Company[]> => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('companies')
      .select('*, settings(*)')
      .order('created_at', { ascending: false });
    
    return (data || []).map(company => ({
      ...company,
      settings: company.settings[0] || null
    }));
  },

  getAllCompaniesStats: async (): Promise<CompanyStats[]> => {
    const supabase = getSupabase();
    
    const { data: companies } = await supabase
      .from('companies')
      .select('*, settings(*)');
    
    if (!companies) return [];

    const stats: CompanyStats[] = [];

    for (const company of companies) {
      const settings = company.settings[0];
      
      const { data: logs } = await supabase
        .from('sms_logs')
        .select('status, created_at')
        .eq('company_id', company.id);

      const sms_sent = logs?.filter(l => l.status === 'sent').length || 0;
      const calls_filtered = logs?.filter(l => l.status === 'blocked').length || 0;
      const errors = logs?.filter(l => l.status === 'error').length || 0;

      const lastActivity = logs && logs.length > 0 
        ? logs[0].created_at 
        : null;

      stats.push({
        company_id: company.id,
        company_name: company.name,
        email: company.email,
        subscription_plan: company.subscription_plan,
        sms_credits: settings?.sms_credits || 0,
        use_custom_provider: settings?.use_custom_provider || false,
        sms_sent,
        calls_filtered,
        errors,
        last_activity: lastActivity
      });
    }

    return stats;
  },

  upsertCompany: async (company: Partial<Company>) => {
    const supabase = getSupabase();
    
    if (company.id) {
      const { data, error } = await supabase
        .from('companies')
        .update(company)
        .eq('id', company.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('companies')
        .insert([{
          ...company,
          status: company.status || 'active',
          subscription_plan: company.subscription_plan || 'basic',
          credit_history: company.credit_history || []
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  deleteCompany: async (companyId: string) => {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);
    
    if (error) throw error;
  },

  createCompany: async (data: {
    name: string;
    email: string;
    plan: 'basic' | 'pro';
    password: string;
    siret?: string;
    vat_number?: string;
    address?: string;
    phone?: string;
    contact_name?: string;
    notes?: string;
  }) => {
    const supabase = getSupabase();
    
    const { data: newComp, error } = await supabase
      .from('companies')
      .insert([{
        name: data.name,
        email: data.email.toLowerCase().trim(),
        password_hash: data.password,
        status: 'active',
        subscription_plan: data.plan,
        siret: data.siret,
        vat_number: data.vat_number,
        address: data.address,
        phone: data.phone,
        contact_name: data.contact_name,
        notes: data.notes,
        credit_history: []
      }])
      .select()
      .single();
    
    if (error) throw error;
    return newComp;
  },

  getCompanyDetails: async (companyId: string) => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    return data;
  },

  addCredits: async (companyId: string, amount: number, price: number, reference: string) => {
    const supabase = getSupabase();
    
    const { data: company } = await supabase
      .from('companies')
      .select('credit_history')
      .eq('id', companyId)
      .single();
    
    const newTransaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      amount_credits: amount,
      amount_paid: price,
      reference: reference || `CREDIT-${Date.now()}`,
      type: 'credit'
    };
    
    const updatedHistory = [...(company?.credit_history || []), newTransaction];
    
    await supabase
      .from('companies')
      .update({ credit_history: updatedHistory })
      .eq('id', companyId);
    
    const { data: settings } = await supabase
      .from('settings')
      .select('sms_credits')
      .eq('company_id', companyId)
      .single();
    
    await supabase
      .from('settings')
      .update({ sms_credits: (settings?.sms_credits || 0) + amount })
      .eq('company_id', companyId);
  },

  saveSystemConfig: async (config: SystemConfig) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('system_config')
      .upsert(config)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  resetAllData: async () => {
    const supabase = getSupabase();
    await supabase.from('form_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('sms_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('settings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  },

  // ============ FORMULAIRES ============

  submitForm: async (submission: Omit<FormSubmission, 'id' | 'submitted_at'>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([submission])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  getFormSubmissions: async (companyId: string): Promise<FormSubmission[]> => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('company_id', companyId)
      .order('submitted_at', { ascending: false });
    
    return data || [];
  },

  updateFormSubmission: async (submissionId: string, updates: Partial<FormSubmission>) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('form_submissions')
      .update(updates)
      .eq('id', submissionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // ============ CONFIGURATION SYSTÈME ============

  getSystemConfig: async (): Promise<SystemConfig | null> => {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('system_config')
      .select('*')
      .single();
    
    return data;
  },

  updateSystemConfig: async (config: SystemConfig) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('system_config')
      .upsert(config)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

async function createDefaultSettings(
  supabase: SupabaseClient, 
  companyId: string, 
  companyName: string, 
  email: string
) {
  const senderId = companyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 11).toUpperCase();
  
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
    company_id: companyId,
    company_name: companyName,
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
  
  console.log(`[CREATE_SETTINGS] ✅ Settings créés pour ${companyName}`);
}