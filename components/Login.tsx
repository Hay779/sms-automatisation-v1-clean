
import React, { useState } from 'react';
import { Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { ApiService } from '../services/supabaseApi';
import { UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (role: UserRole, rememberMe: boolean, companyId?: string) => void;
  onRegisterClick: () => void;
  settings?: any; 
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onRegisterClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await ApiService.login(email, password);
      
      if (result.success && result.role) {
        onLoginSuccess(result.role, rememberMe, result.companyId);
      } else {
        setError(result.message || 'Identifiants incorrects.');
        setIsLoading(false);
      }
    } catch (e) {
      setError('Erreur de connexion.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in">
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900 opacity-90 z-0"></div>
          
          <div className="relative z-10">
            <div className="mx-auto bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-900/50 transform rotate-3">
                <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white mb-1 tracking-tight flex items-center justify-center">
                SMS AUTO
                <span className="ml-2 text-xs bg-indigo-500 text-indigo-100 px-2 py-0.5 rounded-full font-mono border border-indigo-400">v1.0</span>
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
                Plateforme de Gestion & Automatisation
            </p>
          </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="nom@entreprise.com"
                />
              </div>
            </div>

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
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer">
                  Se souvenir de moi
                </label>
              </div>
              <button type="button" onClick={() => window.location.href = "mailto:support@sms-auto.pro"} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  Mot de passe oublié ?
              </button>
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
              {isLoading ? 'Connexion...' : (
                <>
                  ACCÉDER AU PORTAIL
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-sm text-slate-600 mb-4">
                Pas encore de compte ?{' '}
                <button onClick={onRegisterClick} className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                    Créer un compte
                </button>
             </p>
             
             <div className="flex justify-center space-x-4 pt-4 border-t border-slate-50">
                 <p className="text-xs text-slate-400 text-center w-full">Identifiants Démo : master@agence.com / master</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
