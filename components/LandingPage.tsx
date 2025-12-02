
import React from 'react';
import { Smartphone, Zap, ArrowRight, MessageSquare, LayoutTemplate, CheckCircle, PieChart, Star, ShieldCheck, Globe, CreditCard, ScanLine, BellRing, MousePointerClick, Menu, X, Mail, MapPin } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault(); // Empêche le saut brutal et le rechargement
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Hauteur du menu + un peu d'espace
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div 
            className="flex items-center space-x-2 cursor-pointer group" 
            onClick={scrollToTop}
          >
            <div className="bg-indigo-600 p-1.5 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-sm">
                <Smartphone className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 group-hover:text-indigo-900 transition-colors">SMS AUTO <span className="text-indigo-600">v1</span></span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
             <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Comment ça marche</a>
             <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Fonctionnalités</a>
             <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer">Tarifs</a>
             <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                <button 
                    onClick={onLoginClick}
                    className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
                >
                    Connexion
                </button>
                <button 
                    onClick={onRegisterClick}
                    className="bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center"
                >
                    Essai Gratuit <ArrowRight className="ml-1 w-4 h-4"/>
                </button>
             </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2">
                  {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-b border-slate-200 p-4 absolute w-full shadow-xl animate-in slide-in-from-top-5">
                <div className="flex flex-col space-y-4">
                    <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="text-left text-sm font-medium text-slate-600 p-2 hover:bg-slate-50 rounded cursor-pointer">Comment ça marche</a>
                    <a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="text-left text-sm font-medium text-slate-600 p-2 hover:bg-slate-50 rounded cursor-pointer">Fonctionnalités</a>
                    <a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="text-left text-sm font-medium text-slate-600 p-2 hover:bg-slate-50 rounded cursor-pointer">Tarifs</a>
                    <hr />
                    <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="text-left text-sm font-bold text-slate-600 p-2">Connexion</button>
                    <button onClick={() => { onRegisterClick(); setIsMobileMenuOpen(false); }} className="text-left text-sm font-bold text-indigo-600 p-2">Inscription</button>
                </div>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-indigo-100">
                    <Zap className="w-3 h-3" />
                    <span>Nouvelle version v1.0 disponible</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900">
                    Ne ratez plus <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">aucun business.</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
                    Notre robot transforme automatiquement vos appels manqués en formulaires de qualification. Gagnez du temps, qualifiez vos prospects et remplissez votre CRM sans lever le petit doigt.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={onRegisterClick} className="flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">
                        Démarrer maintenant
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                    <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} className="flex items-center justify-center px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all cursor-pointer">
                        Découvrir
                    </a>
                </div>
                <div className="flex items-center space-x-6 text-sm text-slate-500 pt-4">
                    <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500"/> Sans engagement</span>
                    <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-emerald-500"/> Installation en 2min</span>
                </div>
            </div>

            {/* Visual */}
            <div className="relative z-10 hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
                 <div className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border-8 border-slate-800 rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-[1.02] cursor-default group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2rem] pointer-events-none"></div>
                      <div className="bg-slate-800 rounded-[2rem] overflow-hidden aspect-video relative">
                          {/* Fake UI */}
                          <div className="absolute top-0 left-0 w-full h-full flex flex-col">
                              <div className="bg-slate-700 h-10 flex items-center px-6 space-x-2 border-b border-slate-600/50">
                                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                              </div>
                              <div className="flex-1 bg-slate-50 p-8 flex items-center justify-center relative overflow-hidden">
                                   {/* Abstract Phone Mockup */}
                                   <div className="absolute -right-20 top-20 w-64 h-64 bg-indigo-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                                   <div className="absolute -left-20 bottom-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70"></div>
                                   
                                   <div className="text-center space-y-6 relative z-10 w-full max-w-sm">
                                       {/* Notification Bubble */}
                                       <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-4 transform transition-all group-hover:-translate-y-2">
                                           <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-500">
                                               <PhoneMissedIcon />
                                           </div>
                                           <div className="text-left flex-1">
                                               <div className="h-2 w-20 bg-slate-200 rounded mb-2"></div>
                                               <div className="h-2 w-32 bg-slate-100 rounded"></div>
                                           </div>
                                           <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Missed</span>
                                       </div>

                                       {/* Arrow */}
                                       <div className="flex justify-center">
                                           <div className="w-0.5 h-8 bg-slate-300"></div>
                                       </div>

                                       {/* SMS Bubble */}
                                       <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-200 text-white flex items-center space-x-4 transform transition-all group-hover:translate-y-2">
                                           <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white">
                                               <MessageSquare className="w-6 h-6" />
                                           </div>
                                           <div className="text-left flex-1">
                                               <p className="text-xs font-bold opacity-70 mb-1">AUTO-REPLY</p>
                                               <p className="text-sm font-medium">Bonjour, cliquez ici pour qualifier votre demande...</p>
                                           </div>
                                       </div>
                                   </div>
                              </div>
                          </div>
                      </div>
                 </div>
                 {/* Decorative Blobs */}
                 <div className="absolute -top-10 -right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                 <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-20">
                  <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm">Processus</span>
                  <h2 className="text-4xl font-black text-slate-900 mt-2 mb-4">Simple comme un coup de fil</h2>
                  <p className="text-slate-500 text-lg max-w-2xl mx-auto">Installation en 3 étapes. Aucune compétence technique requise. Votre standardiste virtuel est prêt en 2 minutes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                  {/* Connector Line */}
                  <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-indigo-50 via-indigo-200 to-indigo-50 z-0"></div>

                  {/* Step 1 */}
                  <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-24 h-24 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300">
                          <span className="text-4xl font-black text-indigo-600">1</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Connectez votre ligne</h3>
                      <p className="text-slate-500 text-sm leading-relaxed px-4">
                          Entrez l'URL Webhook fournie dans votre manager OVH ou Twilio. C'est le seul paramétrage technique à faire.
                      </p>
                  </div>

                  {/* Step 2 */}
                  <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-24 h-24 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300 delay-100">
                          <span className="text-4xl font-black text-indigo-600">2</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Créez votre formulaire</h3>
                      <p className="text-slate-500 text-sm leading-relaxed px-4">
                          Utilisez notre éditeur "Glisser-Déposer" pour définir les questions à poser (Photos, Urgence, Description...).
                      </p>
                  </div>

                  {/* Step 3 */}
                  <div className="relative z-10 flex flex-col items-center text-center group">
                      <div className="w-24 h-24 bg-white border-4 border-indigo-50 rounded-full flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform duration-300 delay-200">
                          <span className="text-4xl font-black text-indigo-600">3</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">Recevez les dossiers</h3>
                      <p className="text-slate-500 text-sm leading-relaxed px-4">
                          Dès qu'un client appelle, il reçoit le SMS. Vous recevez sa fiche qualifiée directement dans votre Dashboard.
                      </p>
                  </div>
              </div>
          </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                  <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm">Tout inclus</span>
                  <h2 className="text-3xl font-black text-slate-900 mt-2 mb-4">Un outil puissant pour les Pros</h2>
                  <p className="text-slate-500 text-lg">Tout ce dont vous avez besoin pour gérer vos leads entrants.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <FeatureCard 
                    icon={<LayoutTemplate className="w-6 h-6 text-white"/>} 
                    color="bg-indigo-500"
                    title="Page Builder Mobile" 
                    desc="Créez des mini-sites parfaits pour mobile. Demandez des photos, vidéos et localisations sans coder."
                  />
                  <FeatureCard 
                    icon={<ScanLine className="w-6 h-6 text-white"/>} 
                    color="bg-rose-500"
                    title="QR Code Comptoir" 
                    desc="Imprimez votre QR Code pour que les clients en boutique puissent aussi déposer une demande."
                  />
                  <FeatureCard 
                    icon={<Globe className="w-6 h-6 text-white"/>} 
                    color="bg-blue-500"
                    title="Multi-Prestataires" 
                    desc="Connectez OVH, Twilio ou Capitole Mobile. Gardez votre liberté et vos tarifs négociés."
                  />
                  <FeatureCard 
                    icon={<ShieldCheck className="w-6 h-6 text-white"/>} 
                    color="bg-emerald-500"
                    title="RGPD & Légal" 
                    desc="Blocs de consentement intégrés et signature électronique des demandes pour votre conformité."
                  />
                  <FeatureCard 
                    icon={<BellRing className="w-6 h-6 text-white"/>} 
                    color="bg-amber-500"
                    title="Notifications Live" 
                    desc="Recevez un email ou un SMS instantané dès qu'un prospect chaud remplit votre formulaire."
                  />
                  <FeatureCard 
                    icon={<PieChart className="w-6 h-6 text-white"/>} 
                    color="bg-purple-500"
                    title="CRM Intégré" 
                    desc="Suivez l'état de chaque dossier (Nouveau, Traité, Archivé) et analysez vos performances."
                  />
              </div>
          </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-900 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
              <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-600 rounded-full blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <span className="text-indigo-400 font-bold tracking-wider uppercase text-sm">Tarifs Transparents</span>
                  <h2 className="text-3xl font-black mt-2 mb-4">Choisissez votre formule</h2>
                  <p className="text-slate-400 text-lg">Pas de frais cachés. Annulable à tout moment.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* SOLO */}
                  <PricingCard 
                    title="Découverte" 
                    price="0" 
                    features={[
                        "50 SMS offerts",
                        "1 Utilisateur",
                        "Formulaire Standard",
                        "Support Email"
                    ]}
                    cta="Essayer Gratuitement"
                    onClick={onRegisterClick}
                  />

                  {/* PRO */}
                  <PricingCard 
                    title="Pro" 
                    price="29" 
                    isPopular 
                    features={[
                        "SMS Illimités (Votre clé)",
                        "Ou Pack 500 SMS inclus",
                        "Page Builder Complet",
                        "QR Code & Notifications",
                        "Support Prioritaire"
                    ]}
                    cta="Choisir Pro"
                    onClick={onRegisterClick}
                  />

                  {/* AGENCY */}
                  <PricingCard 
                    title="Agence" 
                    price="99" 
                    features={[
                        "Multi-Comptes Clients",
                        "Marque Blanche",
                        "API Complète",
                        "Facturation Centralisée",
                        "Account Manager dédié"
                    ]}
                    cta="Contacter Ventes"
                    onClick={() => window.location.href = "mailto:sales@sms-auto.pro"}
                  />
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center space-x-2 mb-4 text-white">
                      <Smartphone className="w-5 h-5" />
                      <span className="font-bold text-lg">SMS AUTO v1</span>
                  </div>
                  <p className="text-sm max-w-xs leading-relaxed">
                      La solution n°1 pour automatiser la qualification de prospects par SMS. Transformez chaque appel en opportunité.
                  </p>
              </div>
              <div>
                  <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Produit</h4>
                  <ul className="space-y-2 text-sm">
                      <li><a href="#features" onClick={(e) => handleNavClick(e, 'features')} className="hover:text-white transition-colors cursor-pointer">Fonctionnalités</a></li>
                      <li><a href="#pricing" onClick={(e) => handleNavClick(e, 'pricing')} className="hover:text-white transition-colors cursor-pointer">Tarifs</a></li>
                      <li><a href="#" className="hover:text-white transition-colors cursor-pointer">API Docs</a></li>
                  </ul>
              </div>
              <div>
                  <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Légal</h4>
                  <ul className="space-y-2 text-sm">
                      <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Mentions Légales</a></li>
                      <li><a href="#" className="hover:text-white transition-colors cursor-pointer">CGV / CGU</a></li>
                      <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Confidentialité</a></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs">
              <p>&copy; 2024 SMS Auto SaaS. Tous droits réservés.</p>
              <p className="mt-2 md:mt-0 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Systèmes opérationnels
              </p>
          </div>
      </footer>
    </div>
  );
};

// --- Sub-components for Landing Page ---

const PhoneMissedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="23" y1="1" x2="17" y2="7"></line><line x1="17" y1="1" x2="23" y2="7"></line><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
);

const FeatureCard = ({ icon, color, title, desc }: { icon: any, color: string, title: string, desc: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </div>
);

const PricingCard = ({ title, price, features, cta, isPopular, onClick }: { title: string, price: string, features: string[], cta: string, isPopular?: boolean, onClick: () => void }) => (
    <div className={`relative bg-slate-800 rounded-2xl p-8 border ${isPopular ? 'border-indigo-500 shadow-2xl shadow-indigo-900/50 scale-105 z-10' : 'border-slate-700'} flex flex-col`}>
        {isPopular && (
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                Recommandé
            </div>
        )}
        <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-slate-300 uppercase tracking-widest">{title}</h3>
            <div className="mt-4 flex items-baseline justify-center">
                <span className="text-4xl font-black text-white">{price}€</span>
                <span className="text-slate-500 ml-1">/mois</span>
            </div>
        </div>
        <ul className="space-y-4 mb-8 flex-1">
            {features.map((feat, i) => (
                <li key={i} className="flex items-center text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mr-3 shrink-0" />
                    {feat}
                </li>
            ))}
        </ul>
        <button 
            onClick={onClick}
            className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                isPopular 
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg' 
                : 'bg-slate-700 text-white hover:bg-slate-600'
            }`}
        >
            {cta}
        </button>
    </div>
);
