# Planificateur J.Moulin

Outil de planification collaboratif avec gestion des rôles (Admin/TeamLead/TeamMate), gestion d'équipes, tâches avec deadlines et événements fixes.

## Stack

- **Frontend**: SvelteKit + Svelte 5 + Tailwind CSS — PWA installable (`@vite-pwa/sveltekit`)
- **Backend**: Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: JWT + Argon2id password hashing
- **Hosting**: Docker Compose, auto-hébergé (Raspberry Pi), derrière un reverse proxy Nginx
- **CI**: GitHub Actions (lint, typecheck, build, validation Docker)

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

## Déploiement (Docker)

L'application tourne sur un **Raspberry Pi** (hostname `caesura`), via Docker Compose. Un conteneur **Nginx** fait office de point d'entrée unique : il sert de reverse proxy vers le frontend (SvelteKit / adapter-node) et vers le backend (`/api/*`), sur un seul port exposé.

```
navigateur → Nginx (:8081) ─┬─ /api/*  → backend  (Express, port interne 3000)
                             └─ /*      → frontend (SvelteKit, port interne 3000)
```

### 1. Configurer l'environnement

```bash
cp backend/.env.example backend/.env
# Éditer backend/.env : DATABASE_URL, JWT_SECRET (32+ caractères en prod), etc.
```

### 2. Lancer

```bash
docker compose up --build -d
```

L'app est accessible sur `http://caesura:8081` (remplacer `caesura` par le hostname/IP réel du Pi sur ton réseau, ou via Tailscale).

> Si l'app était déjà exposée publiquement (tunnel Cloudflare, port-forward routeur, etc.), il faut mettre à jour la cible pour pointer vers le port **8081** — les anciens ports 3005 (backend) et 5173 (frontend) ne sont plus exposés individuellement, tout passe désormais par Nginx.

### 3. Migrations Prisma

Le conteneur backend exécute `prisma db push` à chaque démarrage (`CMD` du Dockerfile) — les migrations de schéma sont donc appliquées automatiquement au déploiement.

Pour les migrations manuelles :
```bash
docker compose exec backend npm run db:migrate
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

## Dépannage

### DB non accessible
- Vérifier que le conteneur `postgres` est `healthy` : `docker compose ps`
- Vérifier la `DATABASE_URL` dans `backend/.env`

### JWT secret vide ou trop court
- En production, le backend refuse de démarrer si `JWT_SECRET` fait moins de 32 caractères
- Générer une clé forte : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 502 / 404 via Nginx
- Vérifier que les conteneurs `backend` et `frontend` sont bien démarrés : `docker compose ps`
- Vérifier les logs : `docker compose logs nginx backend frontend`

## Roadmap future

- [ ] Tests unitaires (Vitest)
- [ ] Notifications temps réel (WebSocket)
- [ ] Export des données (CSV/PDF)
- [ ] Intégration calendrier externe (Google, Outlook)
- [ ] Dark mode
- [ ] i18n (French/English)

## License

MIT - © J.Moulin
