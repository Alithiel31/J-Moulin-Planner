# ⚡ Quick Start - 5 minutes

## Objectif
Avoir le Planificateur J.Moulin en développement local + déployé sur Railway

## 1️⃣ Local (2 min)

### Installer et lancer

```bash
# Cloner/télécharger le projet
cd planificateur-j-moulin

# Installer les dépendances
npm install

# Copier l'env
cp .env.example .env.local

# Éditer .env.local
# DATABASE_URL doit pointe sur une DB PostgreSQL locale ou distante
# Ou utiliser une instance Railway PostgreSQL

# Démarrer
npm run dev
```

Ouvrir http://localhost:5173

### Créer un compte test

- **Admin** (premier compte créé)
  - Username: `admin`
  - Password: `password123`
  - Role: Admin
  
- Puis créer d'autres comptes pour tester

## 2️⃣ Railway (3 min)

### Préparation GitHub

```bash
git init
git add .
git commit -m "Initial"
git remote add origin https://github.com/TON_USER/planificateur-j-moulin.git
git push -u origin main
```

### Sur Railway

1. Aller https://railway.app → Sign up (gratuit)
2. "Create Project" → "Deploy from GitHub repo"
3. Sélectionner ton repo
4. Railway va builder automatiquement
5. Une fois build fini, ajouter PostgreSQL :
   - "+ Add Service" → PostgreSQL
6. Ajouter variables d'environnement :
   - `JWT_SECRET` = (générer une clé)
   - `NODE_ENV` = `production`

⏳ Attendre que tout soit "Running" (vert)

### Accéder à l'app

https://planificateur-j-moulin-production-xxxx.railway.app

Se connecter avec le compte créé en local, ou en créer un nouveau.

## Structure fichiers importants

```
├── package.json          ← npm install, scripts
├── prisma/schema.prisma  ← Schéma DB (à.modifier = migrations)
├── src/
│   ├── lib/
│   │   └── server/
│   │       ├── db.js     ← Prisma client
│   │       └── auth.js   ← JWT + passwords
│   └── routes/
│       ├── +page.svelte  ← Login
│       └── api/
│           ├── auth/     ← Signup, login, logout
│           ├── tasks/    ← CRUD tâches
│           └── events/   ← CRUD événements
├── Dockerfile            ← Build pour Railway
└── README.md             ← Doc complète
```

## Commandes utiles

```bash
# Développement
npm run dev               # Lancer dev server
npm run db:studio        # GUI pour la DB (port 5555)
npm run db:migrate       # Appliquer migrations

# Production
npm run build            # Build
npm run preview          # Preview du build

# Maintenance
npm run lint             # Linter le code
npm run format           # Formater (prettier)
```

## Premiers pas dans l'app

1. **Connexion** → voir login page
2. **Signup** → choisir un rôle
3. **Admin** → peut créer des événements (repères) et voir tout
4. **TeamLead** → peut créer une équipe et assigner des tâches
5. **TeamMate** → peut voir ses tâches et l'équipe

## Problèmes courants

**"Port 5173 déjà utilisé"**
```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

**"Prisma client not generated"**
```bash
npx prisma generate
```

**"DATABASE_URL missing"**
```bash
# Vérifier .env.local existe et a DATABASE_URL
cat .env.local
```

**"Connection refused"**
- PostgreSQL doit être running (local ou Railway)
- Vérifier la CONNECTION_STRING

## Prochaines étapes

- [ ] Lire README.md pour détails complets
- [ ] Lire DEPLOYMENT.md pour Railroad en détail
- [ ] Modifier schema.prisma si besoin (ajouter fields, etc)
- [ ] Implémenter le reste des endpoints API
- [ ] Créer les pages dashboard (Svelte)
- [ ] Ajouter tests

## Support rapide

Besoin d'aide ?
- **Logs local** : `npm run dev` = voir erreurs en temps réel
- **Logs Railway** : Dashboard → Deployments → View Logs
- **Docs SvelteKit** : https://kit.svelte.dev
- **Docs Railway** : https://docs.railway.app

Bon code ! 🚀
