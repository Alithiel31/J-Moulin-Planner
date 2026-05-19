# 📦 Planificateur J.Moulin - Contenu du projet

## 📂 Structure complète

```
planificateur-j-moulin/
│
├── 📋 Configuration & Déploiement
│   ├── package.json           → Dépendances npm + scripts
│   ├── Dockerfile             → Build multi-stage pour Railway
│   ├── .dockerignore          → Fichiers ignorés au build
│   ├── .gitignore             → Fichiers ignorés par Git
│   ├── .env.example           → Variables d'environnement (template)
│   ├── svelte.config.js       → Config SvelteKit
│   ├── vite.config.js         → Config Vite
│   ├── tailwind.config.js     → Config Tailwind CSS
│   └── postcss.config.js      → Config PostCSS (Tailwind)
│
├── 📚 Documentation
│   ├── README.md              → Doc complète + API
│   ├── QUICKSTART.md          → Démarrage rapide (5 min)
│   └── DEPLOYMENT.md          → Guide Railway étape par étape
│
├── 💾 Database
│   └── prisma/
│       └── schema.prisma      → Schéma Prisma (Users, Tasks, Teams, Events)
│
└── 💻 Code Source
    └── src/
        │
        ├── 🎨 Styles
        │   └── app.css        → Global CSS + Tailwind
        │
        ├── 🔐 Server
        │   ├── hooks.server.js       → Middleware JWT
        │   └── lib/server/
        │       ├── db.js             → Prisma client (singleton)
        │       ├── auth.js           → JWT + Argon2id hashing
        │       └── types.ts          → Types TypeScript
        │
        ├── 📦 State & Stores
        │   └── lib/stores/
        │       └── auth.js           → Svelte store (currentUser)
        │
        ├── 🖼️ UI
        │   ├── routes/
        │   │   ├── +layout.svelte    → Layout principal
        │   │   ├── +page.svelte      → Page de login
        │   │   └── dashboard/
        │   │       └── +page.svelte  → Dashboard (à implémenter)
        │   │
        │   └── lib/components/       → (À créer) Composants réutilisables
        │
        └── 🔌 API Endpoints
            └── routes/api/
                │
                ├── auth/
                │   ├── login/+server.ts      → POST: authentification JWT
                │   ├── signup/+server.ts     → POST: créer compte
                │   ├── logout/+server.ts     → POST: déconnexion
                │   └── me/+server.ts         → GET: utilisateur courant
                │
                ├── tasks/
                │   └── +server.ts            → GET: lister tâches
                │                             → POST: créer tâche
                │                             → (PATCH/DELETE: à implémenter)
                │
                ├── events/
                │   └── +server.ts            → GET: lister événements
                │                             → POST: créer événement (Admin)
                │
                └── teams/                    → (À implémenter)
                    └── +server.ts            → CRUD équipes
```

## 📊 Database Schema

### Entités

```
User
├── id (PK)
├── username (unique)
├── password (Argon2id)
├── role: 'admin' | 'teamlead' | 'teammate'
├── teamId (FK → Team)
└── Timestamps: createdAt, updatedAt

Team
├── id (PK)
├── name (unique)
├── leadId (unique FK → User.id)
└── members (FK → User[])

Task
├── id (PK)
├── title, description
├── category (defaut: 'Autre')
├── startDate (optionnel)
├── deadline
├── priority: 'low' | 'medium' | 'high'
├── status: 'todo' | 'in_progress' | 'done'
├── createdById (FK → User)
├── teamId (FK → Team, optionnel)
└── assignees (FK → TaskAssignee[])

TaskAssignee (junction table)
├── id (PK)
├── taskId (FK → Task)
├── userId (FK → User)
└── Unique: (taskId, userId)

Event
├── id (PK)
├── name
├── date
└── Timestamps
```

## 🔑 Variables d'environnement requises

**Obligatoires :**
- `DATABASE_URL` → PostgreSQL connection string
  - Format: `postgresql://user:password@host:port/database`
  - Sur Railway: auto-générée

- `JWT_SECRET` → Clé pour signer les JWT
  - Générer: `openssl rand -hex 32`
  - Min 32 caractères

**Optionnels :**
- `NODE_ENV` → `production` (défaut) ou `development`

## 🚀 Endpoints API (implémentés)

### Authentication
- **POST** `/api/auth/signup`
  - Body: `{ username, password, role }`
  - Returns: `{ user }`

- **POST** `/api/auth/login`
  - Body: `{ username, password }`
  - Returns: `{ user }` + Set-Cookie: auth

- **POST** `/api/auth/logout`
  - Deletes: auth cookie

- **GET** `/api/auth/me`
  - Returns: `{ user }` ou `{ user: null }`

### Tasks
- **GET** `/api/tasks`
  - Auth required
  - Returns: `{ tasks }` (filtrées par permissions)

- **POST** `/api/tasks`
  - Auth: TeamLead/Admin only
  - Body: `{ title, description, category, startDate, deadline, priority, assignees }`
  - Returns: `{ task }`

### Events
- **GET** `/api/events`
  - Auth required
  - Returns: `{ events }`

- **POST** `/api/events`
  - Auth: Admin only
  - Body: `{ name, date }`
  - Returns: `{ event }`

## 📋 À faire (TODO)

### Endpoints API
- [ ] PATCH `/api/tasks/:id` - Modifier tâche
- [ ] DELETE `/api/tasks/:id` - Supprimer tâche
- [ ] PATCH `/api/tasks/:id/status` - Changer status
- [ ] DELETE `/api/events/:id` - Supprimer événement (Admin)
- [ ] POST `/api/teams` - Créer équipe (TeamLead)
- [ ] GET `/api/teams/:id` - Détails équipe
- [ ] PATCH `/api/teams/:id` - Modifier équipe

### Frontend
- [ ] Dashboard complet (list + gantt + settings)
- [ ] Composants réutilisables (TaskCard, EventBar, Avatar, etc)
- [ ] Page dashboard pour chaque rôle
- [ ] Formulaires créer/modifier tâches
- [ ] Formulaires gérer équipes
- [ ] Filtrage tâches (mes tâches, par équipe, par statut)
- [ ] Frise Gantt avec événements

### Features
- [ ] WebSocket pour live updates
- [ ] Notifications
- [ ] Export CSV/PDF
- [ ] Dark mode
- [ ] i18n (FR/EN)
- [ ] Pagination tâches
- [ ] Search tâches

## 🎯 Phases d'implémentation suggérées

### Phase 1 (Backend + Auth) - ✅ Fait
- ✅ Prisma schema
- ✅ Endpoints auth (login, signup)
- ✅ JWT + password hashing
- ✅ Hooks de vérification JWT

### Phase 2 (API Tasks/Events) - ⏳ En cours
- [ ] Endpoints CRUD complets (tasks, events, teams)
- [ ] Validations côté serveur
- [ ] Permissions cohérentes

### Phase 3 (Frontend) - 📅 Après phase 2
- [ ] Pages principales (login, dashboard)
- [ ] Composants
- [ ] Intégration API

### Phase 4 (Frise + avancé) - 🎨 Finale
- [ ] Frise Gantt avec événements
- [ ] Features avancées (WebSocket, export, etc)

## 🔐 Permissions (rappel)

**Admin**
- CRUD tout
- Créer événements
- Vision globale

**TeamLead**
- Crée son équipe
- CRUD tâches de son équipe
- Assigne à ses équipiers

**TeamMate**
- Lit tâches de son équipe
- Filtre sur ses assignations
- Lecture seule

## 📦 Dépendances principales

### Frontend
- `svelte` 5.x - Framework UI
- `@sveltejs/kit` 2.x - Meta framework
- `tailwindcss` 3.x - Styling
- `lucide-svelte` - Icons

### Backend
- `@sveltejs/kit` (serveur SvelteKit)
- `@prisma/client` - ORM
- `jsonwebtoken` - JWT
- `argon2` - Password hashing
- `cookie` - Cookie handling

### Dev
- `vite` - Build tool
- `prisma` - Migration/Studio
- `tailwindcss` - CSS generation
- `svelte` compiler

## 🚀 Pour déployer sur Railway

1. Push sur GitHub
2. Connecter Railway à GitHub repo
3. Ajouter PostgreSQL service
4. Configurer variables (JWT_SECRET)
5. Attendre le build
6. App est live ! 🎉

Voir **DEPLOYMENT.md** pour les étapes détaillées.

---

**Créé le**: 2026-05-19  
**Projet**: Planificateur J.Moulin  
**Stack**: SvelteKit + PostgreSQL + Railway
