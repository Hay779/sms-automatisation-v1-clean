
export enum LogStatus {
  SENT = 'sent',
  FILTERED = 'filtered',
  ERROR = 'error'
}

export type UserRole = 'SUPER_ADMIN' | 'CLIENT';
export type SmsProvider = 'ovh' | 'twilio' | 'capitole';

export interface SmsLog {
  id: number;
  company_id: string;
  phone: string;
  message: string;
  status: LogStatus;
  reason: string;
  call_id: string;
  created_at: string;
  has_submission?: boolean; // If linked to a form submission
}

export interface ScheduleConfig {
  enabled: boolean;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
  start_time: string;
  end_time: string;
}

// --- NEW BLOCK SYSTEM ---
export type BlockType = 'header' | 'paragraph' | 'text' | 'textarea' | 'photo' | 'video' | 'checkbox' | 'separator' | 'contact_info';

export interface FormBlock {
  id: string;
  type: BlockType;
  label: string;
  required: boolean;
  placeholder?: string;
}

export interface WebFormConfig {
  enabled: boolean;
  logo_url: string; 
  page_title: string; 
  company_address: string;
  company_phone: string;
  
  // Dynamic Blocks
  blocks: FormBlock[];

  // Marketing
  enable_marketing: boolean; 
  marketing_text: string; 
  
  // Options Custom (Tags)
  custom_options?: string[];

  // Notifications Admin
  notify_admin_email: boolean;
  admin_notification_email: string;
  admin_email_subject?: string; // Template Subject
  admin_email_body?: string;    // Template Body
  
  notify_admin_sms: boolean;
  admin_notification_phone: string;
  admin_sms_message?: string;   // Template SMS

  // Notifications Client
  notify_client_email: boolean; // Send confirmation email to client
  client_email_subject?: string;// Template Subject
  client_email_body?: string;   // Template Body

  notify_client_sms: boolean;   // Send confirmation SMS to client
  client_sms_message?: string;  // Template SMS
}

export interface FormSubmission {
  id: string;
  ticket_number: string; // NEW: Ticket ID (e.g., #REQ-1234)
  company_id: string;
  phone: string;
  created_at: string;
  answers: { blockId: string; label: string; value: string | boolean | object }[];
  marketing_optin: boolean;
  status: 'new' | 'pending' | 'done' | 'archived';
}

export interface Settings {
  // Configs spécifiques à l'entreprise
  company_name: string;
  company_tagline: string;
  sms_sender_id: string; 
  auto_sms_enabled: boolean;
  sms_message: string;
  cooldown_seconds: number;
  
  // Web Form Configuration
  web_form: WebFormConfig;

  // Wallet / Quota
  sms_credits: number;

  // Schedule
  active_schedule: ScheduleConfig;

  // Auth
  admin_email: string;
  admin_password: string;
  
  // Custom Provider (Billing)
  use_custom_provider: boolean; 
  custom_provider_type: SmsProvider; 
  
  // OVH Fields
  ovh_app_key?: string;
  ovh_app_secret?: string;
  ovh_consumer_key?: string;
  ovh_service_name?: string;
  
  // Twilio Fields
  twilio_account_sid?: string;
  twilio_auth_token?: string;
  twilio_from_number?: string;

  // Capitole Fields
  capitole_api_key?: string;
}

export interface CreditTransaction {
  id: string;
  date: string;
  amount_credits: number;
  amount_paid: number; // Prix payé en €
  reference: string; // Numéro facture
  type: 'credit' | 'debit' | 'adjustment';
}

export interface Company {
  id: string;
  name: string;
  email: string;
  
  // Administrative Details
  siret?: string;
  vat_number?: string; // NEW
  address?: string;
  phone?: string;
  contact_name?: string;
  notes?: string; // NEW: Internal notes

  status: 'active' | 'inactive' | 'pending_verification';
  verification_code?: string; // For 2-step verification

  subscription_plan: 'basic' | 'pro';
  created_at: string;
  settings: Settings;

  // Billing History
  credit_history: CreditTransaction[];
}

export interface DashboardStats {
  sms_sent: number;
  calls_filtered: number;
  errors: number;
}

export interface CompanyStats extends DashboardStats {
  company_id: string;
  company_name: string;
  subscription_plan: 'basic' | 'pro';
  sms_credits: number;
  use_custom_provider: boolean;
  last_activity: string | null;
  email: string; // Added for display
}

export interface SystemConfig {
  active_global_provider: SmsProvider;
  ovh_app_key: string;
  ovh_app_secret: string;
  ovh_consumer_key: string;
  ovh_service_name: string;
  twilio_account_sid: string;
  twilio_auth_token: string;
  twilio_from_number: string;
  capitole_api_key: string;
  supabase_url: string;
  supabase_anon_key: string;
}
