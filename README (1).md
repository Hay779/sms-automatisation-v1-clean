# 📱 SMS Automatisation v1

<div align="center">

**Plateforme SaaS de gestion automatique des SMS après appel et formulaires de qualification client**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 🚀 Fonctionnalités Principales

### 📊 **Gestion Multi-Clients**
- Dashboard super admin pour gérer plusieurs entreprises
- Vue d'ensemble des statistiques globales
- Gestion des crédits SMS par client
- Impersonation pour support client

### 📞 **Automatisation SMS**
- Envoi automatique de SMS après appels manqués
- Filtrage intelligent (lignes fixes, horaires, cooldown)
- Support multi-providers: OVH, Twilio, Capitole
- Système de crédits avec historique

### 📝 **Formulaires Web Dynamiques**
- Builder de formulaires drag & drop
- Blocs personnalisables (texte, photo, vidéo, coordonnées)
- Aperçu mobile en temps réel
- Notifications email/SMS automatiques
- Système de tickets unique

### 🔐 **Sécurité Renforcée**
- Hashing des mots de passe (SHA-256)
- Protection XSS/CSRF
- Validation stricte des entrées
- Rate limiting sur authentification
- Row Level Security (Supabase)
- Headers de sécurité HTTP

### ⚡ **Performance Optimisée**
- Code splitting & lazy loading
- Bundle size optimisé (~200KB)
- Cache intelligent
- Indexes base de données
- Compression assets

---

## 🛠️ Stack Technique

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Vercel

---

## 📦 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- Compte Vercel (pour déploiement)

### 1. Cloner le projet
```bash
git clone <repository-url>
cd sms-automatisation-v1
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Supabase

#### A. Créer un projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et la clé Anon

#### B. Créer les tables
Exécuter le SQL fourni dans votre projet Supabase (voir section SQL ci-dessous)

### 4. Variables d'environnement
Créer `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Lancer en développement
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

---

## 🗄️ Schéma Base de Données

```sql
-- Tables: admins, companies, settings, sms_logs, form_submissions, system_config
-- Voir le fichier SQL complet dans la documentation
```

**Tables créées:**
- `admins` - Comptes super administrateurs
- `companies` - Entreprises clientes
- `settings` - Configuration par entreprise
- `sms_logs` - Historique des SMS
- `form_submissions` - Soumissions formulaires
- `system_config` - Configuration système globale

---

## 🔑 Comptes de Test

### Super Admin
```
Email: master@agence.com
Mot de passe: master
```

### Client Demo
Les clients peuvent s'inscrire via le formulaire d'inscription avec vérification email.

---

## 📁 Structure du Projet

```
/app
├── components/          # Composants React
│   ├── Dashboard.tsx
│   ├── Settings.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── FormSubmissions.tsx
│   ├── SuperAdminDashboard.tsx
│   └── ...
├── services/           # Services API
│   ├── secureSupabaseApi.ts  # API sécurisée (principal)
│   ├── supabaseApi.ts         # API basique
│   └── api.ts                 # Mock (développement)
├── utils/              # Utilitaires
│   └── security.ts     # Fonctions de sécurité
├── types.ts            # Types TypeScript
├── App.tsx             # Composant principal
├── vite.config.ts      # Configuration Vite
├── vercel.json         # Configuration Vercel
├── SECURITY.md         # Guide de sécurité
└── OPTIMIZATION.md     # Guide d'optimisation
```

---

## 🚀 Déploiement sur Vercel

### 1. Préparer le projet
```bash
npm run build
```

### 2. Déployer
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Déployer en production
vercel --prod
```

### 3. Configurer les variables d'environnement
Dans le dashboard Vercel:
1. Settings → Environment Variables
2. Ajouter:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 📊 Scripts Disponibles

```bash
npm run dev          # Développement
npm run build        # Build production
npm run preview      # Prévisualiser build
npm run lint         # Linter (si configuré)
```

---

## 🔒 Sécurité

Voir [SECURITY.md](./SECURITY.md) pour:
- Guide complet de sécurité
- Bonnes pratiques
- Checklist de déploiement
- Tests de sécurité

### Points clés:
✅ Hashing des mots de passe  
✅ Protection XSS/CSRF  
✅ Validation des entrées  
✅ Rate limiting  
✅ Headers HTTP sécurisés  
✅ Row Level Security (Supabase)  

---

## ⚡ Optimisation

Voir [OPTIMIZATION.md](./OPTIMIZATION.md) pour:
- Guide d'optimisation complète
- Code splitting
- Optimisation base de données
- Métriques de performance

### Résultats:
- Bundle size: ~200KB (après optimisation)
- First Load: ~1.5s
- Lighthouse Score: 90+

---

## 🐛 Debugging

### Logs
```typescript
// Activer les logs en développement
console.log('[DEBUG] Message');
```

### Supabase Logs
Dashboard Supabase → Logs → Explorer

### Erreurs communes

**1. "Configuration Supabase manquante"**
→ Vérifier `.env.local`

**2. "Identifiants incorrects"**
→ Vérifier que les tables sont créées

**3. Build error**
→ Vérifier les dépendances: `npm install`

---

## 📚 Documentation Additionnelle

- [Guide Supabase](https://supabase.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🤝 Contribution

Les contributions sont bienvenues!

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Propriétaire - Tous droits réservés

---

## 📞 Support

Pour toute question ou problème:
- Email: support@votre-domaine.com
- Documentation: [Wiki](./docs)

---

<div align="center">

**Développé avec ❤️ par votre équipe**

Version 1.0 - 2024

</div>
