# 🎯 START HERE - Par où commencer

Bienvenue sur **Planificateur J.Moulin** ! 

Ce fichier te guide rapidement sur ce que tu as et comment démarrer.

## ✅ Ce que tu as

Une **application full-stack production-ready** prête à être déployée sur Railway :

### Frontend
- ✅ Page de connexion (Svelte)
- ✅ Layout principal
- ✅ Stores pour l'auth
- 📋 Dashboard à implémenter

### Backend
- ✅ Authentification JWT (Argon2id)
- ✅ Endpoints API (auth, tasks, events)
- ✅ Permissions par rôle (Admin/TeamLead/TeamMate)
- ✅ Middleware JWT

### Database
- ✅ Schéma Prisma complet (Users, Tasks, Teams, Events)
- ✅ Migrations automatiqu es sur Railway

### DevOps
- ✅ Dockerfile multi-stage
- ✅ Configuration pour Railway
- ✅ Scripts npm de dev/build

---

## 🚀 Démarrage rapide (5 minutes)

### 1. Localement

```bash
# Installer
npm install

# Config DB
cp .env.example .env.local
# Éditer .env.local et ajouter ta DATABASE_URL

# Lancer
npm run dev
```

Accéder à http://localhost:5173

### 2. Sur Railway

```bash
# Pousser sur GitHub
git add .
git commit -m "Initial"
git remote add origin https://github.com/TON_USER/planificateur-j-moulin.git
git push

# Sur Railway.app
# - Create Project → From GitHub
# - Add PostgreSQL service
# - Set JWT_SECRET variable
# - Déployer
```

URLs des docs :
- **QUICKSTART.md** ← Lis ça d'abord (5 min)
- **DEPLOYMENT.md** ← Pour Railroad en détail
- **README.md** ← Doc API complète
- **PROJECT.md** ← Vue d'ensemble du code

---

## 📚 Structure (au plus simple)

```
planificateur-j-moulin/
├── package.json           ← npm install, scripts
├── Dockerfile             ← Pour Railway
├── prisma/schema.prisma   ← DB schema
├── src/
│   ├── lib/
│   │   └── server/        ← Code serveur (auth, db)
│   └── routes/
│       ├── +page.svelte   ← Page login
│       └── api/           ← Endpoints (/api/auth/login, etc)
└── docs/ [README, DEPLOYMENT, QUICKSTART, PROJECT]
```

---

## 🔄 Workflow

### Développement local
```bash
npm run dev              # Dev server
npm run db:studio       # GUI base de données
```

### Build & Test
```bash
npm run build           # Build pour prod
npm run preview         # Prévisualiser le build
```

### Déploiement
```bash
git push                # Railroad détecte automatiquement
# ou: railway up        # Si Railway CLI installée
```

---

## 🎯 Next steps (dans l'ordre)

### 1. **Lire QUICKSTART.md** (5 min)
   - Lancer localement
   - Vérifier que ça fonctionne

### 2. **Lire DEPLOYMENT.md** (15 min)
   - Déployer sur Railway
   - Voir l'app en prod

### 3. **Implémenter le frontend** (Frontend engineer's job)
   - Créer les pages dashboard
   - Intégrer l'API
   - Frise Gantt, etc

### 4. **Compléter les endpoints** (Backend engineer's job)
   - PATCH `/api/tasks/:id`
   - DELETE endpoints
   - Endpoints teams
   - Validation + erreurs

### 5. **Features avancées**
   - WebSocket live updates
   - Notifications
   - Export données
   - etc (voir TODO dans PROJECT.md)

---

## 🔑 Technologies clés

| Aspect | Tech | Pour quoi |
|--------|------|-----------|
| Frontend | Svelte 5 | UI interactive |
| Backend | SvelteKit | API REST |
| Database | PostgreSQL | Persistance |
| ORM | Prisma | Queries type-safe |
| Auth | JWT | Sécurité |
| Hosting | Railway | Deploy simplifié |
| CSS | Tailwind | Styling |

---

## 🛠️ Troubleshooting rapide

**"npm install failed"**
```bash
# Vérifier Node.js 18+
node --version

# Réessayer
rm -rf node_modules package-lock.json
npm install
```

**"Port 5173 already in use"**
```bash
npm run dev -- --port 3000
```

**"DATABASE_URL not found"**
```bash
# Vérifier .env.local existe
ls -la .env.local

# Si manquant:
cp .env.example .env.local
# Éditer avec ta DB URL
```

**"Prisma client not generated"**
```bash
npx prisma generate
npm run dev
```

---

## 📖 Où trouver des réponses

| Besoin | Ressource |
|--------|-----------|
| Démarrage rapide | QUICKSTART.md (ce fichier) |
| Déployer sur Railway | DEPLOYMENT.md |
| API complète | README.md |
| Structure code | PROJECT.md |
| SvelteKit docs | https://kit.svelte.dev |
| Prisma docs | https://prisma.io |
| Railway docs | https://docs.railway.app |

---

## 💡 Pro tips

1. **Commencer par QUICKSTART.md** - Ne pas lire tout d'un coup
2. **Tester localement** avant de déployer
3. **Utiliser `npm run db:studio`** pour vérifier la DB
4. **Regarder les logs** en cas d'erreur (`railway logs` sur prod)
5. **Git commits réguliers** - Railway rebuild à chaque push

---

## ✨ Bon code !

L'app est prête, les fondations sont solides.

À toi de l'amener au prochain niveau. 🚀

---

**Questions ?**
- Railway: https://discord.gg/railway
- SvelteKit: https://discord.gg/sveltejs
- Prisma: https://discord.gg/prisma

Bon développement ! 👨‍💻
