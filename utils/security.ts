/**
 * Security Utilities
 * Handles password hashing, validation, and input sanitization
 */

// Simple password hashing using Web Crypto API (browser-compatible)
export const hashPassword = async (password: string): Promise<string> => {
  // For browser environment, we'll use a simple hash
  // In production with a backend, use bcrypt/argon2
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Verify password against hash
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
};

/**
 * Input Validation
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): boolean => {
  // French phone number format: +33XXXXXXXXX or 0XXXXXXXXX
  const phoneRegex = /^(\+33|0)[1-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * XSS Protection - Sanitize HTML input
 */
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Sanitize object recursively
 */
export const sanitizeObject = (obj: any): any => {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }
  return obj;
};

/**
 * Rate limiting helper (client-side)
 */
const rateLimitStore: { [key: string]: number[] } = {};

export const checkRateLimit = (key: string, maxAttempts: number, windowMs: number): boolean => {
  const now = Date.now();
  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }
  
  // Remove old attempts outside the window
  rateLimitStore[key] = rateLimitStore[key].filter(timestamp => now - timestamp < windowMs);
  
  if (rateLimitStore[key].length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  rateLimitStore[key].push(now);
  return true;
};

/**
 * Generate secure random string
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * SQL Injection protection for text inputs
 */
export const sanitizeSqlInput = (input: string): string => {
  // Remove potentially dangerous SQL characters
  return input.replace(/['";\\]/g, '');
};

/**
 * Validate company name
 */
export const validateCompanyName = (name: string): { valid: boolean; message?: string } => {
  if (name.length < 2) {
    return { valid: false, message: 'Le nom de l\'entreprise doit contenir au moins 2 caractères' };
  }
  if (name.length > 100) {
    return { valid: false, message: 'Le nom de l\'entreprise est trop long (max 100 caractères)' };
  }
  return { valid: true };
};

/**
 * Validate SMS Sender ID
 */
export const validateSenderId = (senderId: string): { valid: boolean; message?: string } => {
  if (senderId.length < 3) {
    return { valid: false, message: 'L\'ID expéditeur doit contenir au moins 3 caractères' };
  }
  if (senderId.length > 11) {
    return { valid: false, message: 'L\'ID expéditeur ne peut pas dépasser 11 caractères' };
  }
  if (!/^[A-Z0-9]+$/.test(senderId)) {
    return { valid: false, message: 'L\'ID expéditeur ne peut contenir que des lettres majuscules et des chiffres' };
  }
  return { valid: true };
};

/**
 * CSRF Token management
 */
const CSRF_TOKEN_KEY = 'csrf_token';

export const getCSRFToken = (): string => {
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateSecureToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
};

export const validateCSRFToken = (token: string): boolean => {
  return token === sessionStorage.getItem(CSRF_TOKEN_KEY);
};
