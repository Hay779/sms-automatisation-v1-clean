
import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Briefcase, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api';
import { UserRole } from '../types';

interface RegisterProps {
  onRegisterSuccess: (role: UserRole, rememberMe: boolean, companyId?: string) => void;
  onBackToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onBackToLogin }) => {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1 Data
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Step 2 Data
  const [verificationCode, setVerificationCode] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Mock helper to show code for simulation
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        setIsLoading(false);
        return;
    }

    if (password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        setIsLoading(false);
        return;
    }

    try {
      // In updated API, this returns requireVerification: true
      const result = await ApiService.register(companyName, email, password);
      
      if (result.success && result.requireVerification) {
        if(result.debugCode) setSimulatedCode(result.debugCode);
        setStep(2);
      } else if (result.success && result.companyId) {
        // Should not happen with new logic, but fallback
        onRegisterSuccess('CLIENT', true, result.companyId);
      } else {
        setError(result.message || "Erreur lors de l'inscription.");
      }
    } catch (e) {
      setError("Une erreur technique est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');

      try {
          const result = await ApiService.verifyEmail(email, verificationCode);
          if (result.success && result.companyId) {
              onRegisterSuccess('CLIENT', true, result.companyId);
          } else {
              setError(result.message || "Code invalide.");
          }
      } catch (e) {
          setError("Erreur de validation.");
      } finally {
          setIsLoading(false);
      }
  };

  const handleResendCode = async () => {
      const newCode = await ApiService.resendVerificationCode(email);
      if(newCode) {
          setSimulatedCode(newCode);
          alert(`Nouveau code simulé : ${newCode}`);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header changes based on step */}
        <div className="bg-indigo-900 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-800 to-indigo-950 opacity-90 z-0"></div>
          
          <div className="relative z-10">
            <div className="mx-auto bg-white/10 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                {step === 1 ? <Briefcase className="text-white w-7 h-7" /> : <Mail className="text-white w-7 h-7" />}
            </div>
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight">
                {step === 1 ? 'Créer un compte' : 'Vérifiez votre email'}
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
                {step === 1 ? 'Commencez à automatiser votre relation client.' : `Un code a été envoyé à ${email}`}
            </p>
          </div>
        </div>

        <div className="p-8">
          {step === 1 ? (
              // STEP 1: REGISTRATION FORM
              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom de votre entreprise</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                    placeholder="Garage Dupont"
                    />
                </div>
                </div>

                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email professionnel</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                    placeholder="contact@dupont.com"
                    />
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mot de passe</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                        placeholder="••••••"
                        />
                    </div>
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirmation</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-slate-50 focus:bg-white"
                        placeholder="••••••"
                        />
                    </div>
                    </div>
                </div>

                {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg p-3 flex items-start animate-in fade-in slide-in-from-top-1">
                    <div className="shrink-0 mr-2">⚠️</div>
                    {error}
                </div>
                )}

                <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                {isLoading ? 'Création en cours...' : (
                    <>
                    CONTINUER
                    <ArrowRight className="ml-2 w-4 h-4" />
                    </>
                )}
                </button>
            </form>
          ) : (
              // STEP 2: VERIFICATION FORM
              <form onSubmit={handleVerify} className="space-y-6">
                  
                  {/* Simulation Hint */}
                  {simulatedCode && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800 mb-4 text-center">
                        <strong>💡 Simulation :</strong> Votre code de validation est <strong className="text-lg bg-white px-2 rounded border border-yellow-300 ml-1">{simulatedCode}</strong>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">Entrez le code à 6 chiffres</label>
                    <input
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="block w-full text-center text-3xl font-mono tracking-widest py-3 border border-slate-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="000000"
                        autoFocus
                    />
                  </div>

                  {error && (
                    <div className="bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg p-3 flex items-start animate-in fade-in slide-in-from-top-1">
                        <div className="shrink-0 mr-2">⚠️</div>
                        {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length < 6}
                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                    {isLoading ? 'Vérification...' : (
                        <>
                        ACTIVER MON COMPTE
                        <CheckCircle className="ml-2 w-4 h-4" />
                        </>
                    )}
                  </button>

                  <div className="text-center">
                      <button 
                        type="button"
                        onClick={handleResendCode}
                        className="text-sm text-slate-500 hover:text-indigo-600 flex items-center justify-center w-full"
                      >
                          <RefreshCw className="w-3 h-3 mr-1" /> Renvoyer le code
                      </button>
                  </div>
              </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-600">
                {step === 1 ? 'Vous avez déjà un compte ? ' : 'Mauvaise adresse email ? '}
                <button 
                    onClick={step === 1 ? onBackToLogin : () => setStep(1)} 
                    className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors"
                >
                    {step === 1 ? 'Se connecter' : 'Modifier'}
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
