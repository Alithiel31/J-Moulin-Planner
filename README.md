# Planificateur J.Moulin

Outil de planification collaboratif avec gestion des rôles (Admin/TeamLead/TeamMate), gestion d'équipes, tâches avec deadlines et événements fixes.

## Stack

- **Frontend**: SvelteKit + Svelte 5 + Tailwind CSS
- **Backend**: SvelteKit (+server.ts)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Argon2id password hashing
- **Hosting**: Railway

## Rôles et Permissions

### Admin
- CRUD complet sur tous les éléments (tâches, événements, équipes)
- Création d'événements fixes (repères sur la frise)
- Vision globale du système

### TeamLead
- Création et gestion d'une équipe (sélection des TeamMates)
- Création de tâches et assignation à son équipe
- Accès à tous les éléments de son équipe

### TeamMate
- Consultation des tâches et frise de son équipe
- Filtrage sur ses tâches personnelles
- Accès lecture seule

## Déploiement sur Railway

### 1. Préparation du dépôt

```bash
# Initialiser un repo Git
git init
git add .
git commit -m "Initial commit: Planificateur J.Moulin"

# Créer un repo sur GitHub et pusher
git remote add origin https://github.com/ton-compte/planificateur-j-moulin.git
git push -u origin main
```

### 2. Créer une app Railway

```bash
npm install -g @railway/cli
railway login
railway init
```

Ou depuis le dashboard Railway :
1. Aller sur https://railway.app
2. Créer un nouveau projet
3. Connecter ton repo GitHub

### 3. Configurer la base de données

Sur Railway :
1. Cliquer sur "+ Add Service"
2. Sélectionner "PostgreSQL"
3. Générer un nom auto ou personnalisé

La `DATABASE_URL` sera automatiquement définie dans les variables d'environnement.

### 4. Variables d'environnement

Ajouter dans Railway (Variables) :

```
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=production
```

Générer une clé JWT forte :
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Déployer

**Depuis le CLI :**
```bash
railway up
```

**Depuis GitHub :**
- Railway détectera automatiquement l'app Svelte
- Chaque push déclenchera un nouveau build et déploiement

### 6. Migrations Prisma

Les migrations se font automatiquement au déploiement grâce au Dockerfile qui exécute `prisma generate`.

Pour les migrations manuelles :
```bash
railway run npm run db:migrate
```

## Développement local

### Installation

```bash
npm install
cp .env.example .env.local
```

Configurer `.env.local` avec ta DB locale :
```
DATABASE_URL="postgresql://user:password@localhost:5432/planificateur"
JWT_SECRET="dev-secret"
```

### Démarrer

```bash
npm run dev
# App sur http://localhost:5173
```

### Studio Prisma

```bash
npm run db:studio
```

Ouvre une UI pour gérer ta DB : http://localhost:5555

## Structure du projet

```
src/
├── lib/
│   ├── server/
│   │   ├── db.js          # Prisma client
│   │   └── auth.js        # JWT + password hashing
│   ├── components/        # Composants Svelte réutilisables
│   └── stores/
│       └── auth.js        # Store d'authentification
├── routes/
│   ├── +layout.svelte     # Layout principal
│   ├── +page.svelte       # Page de connexion
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/+server.ts
│   │   │   ├── signup/+server.ts
│   │   │   └── logout/+server.ts
│   │   ├── tasks/+server.ts
│   │   ├── events/+server.ts
│   │   └── teams/+server.ts
│   └── dashboard/
│       └── +page.svelte
└── hooks.server.js        # Middleware d'auth JWT

prisma/
└── schema.prisma          # Schéma DB

Dockerfile                 # Multi-stage pour Railway
```

## API Endpoints

### Auth
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `POST /api/auth/logout` - Se déconnecter
- `GET /api/auth/me` - Infos utilisateur courant

### Tasks
- `GET /api/tasks` - Lister les tâches visibles
- `POST /api/tasks` - Créer une tâche
- `PATCH /api/tasks/[id]` - Modifier une tâche
- `DELETE /api/tasks/[id]` - Supprimer une tâche

### Events
- `GET /api/events` - Lister les événements
- `POST /api/events` - Créer un événement (Admin only)
- `DELETE /api/events/[id]` - Supprimer (Admin only)

### Teams
- `GET /api/teams` - Lister les équipes
- `POST /api/teams` - Créer une équipe (TeamLead)
- `PATCH /api/teams/[id]` - Modifier une équipe

## Données de test

Pour popul vite :
```bash
# Créer des comptes test
# Admin: admin / password
# TeamLead: bob / password (crée équipe "Frontend")
# TeamMate: charlie / password (assigné à "Frontend")
```

## Dépannage Railway

### Les build timeout
- Augmenter le RAM alloué dans Railway
- Vérifier les dépendances optionnelles (`optionalDependencies`)

### DB non accessible
- Vérifier que PostgreSQL est déployée
- Vérifier la `DATABASE_URL` dans les variables

### JWT secret vide
- S'assurer que `JWT_SECRET` est défini dans les variables Railway

## Roadmap future

- [ ] Tests unitaires (Vitest)
- [ ] Notifications temps réel (WebSocket)
- [ ] Export des données (CSV/PDF)
- [ ] Intégration calendrier externe (Google, Outlook)
- [ ] Dark mode
- [ ] i18n (French/English)

## License

MIT - © J.Moulin
