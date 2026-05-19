# 🚀 Déploiement sur Railway - Guide complet

## Prérequis

- [GitHub](https://github.com) (compte gratuit)
- [Railway](https://railway.app) (gratuit avec crédit initial)
- [Node.js](https://nodejs.org) 18+ (local, pour tester)
- Git installé

## Étape 1 : Préparer le code pour GitHub

```bash
# Dans le dossier du projet
git init
git add .
git commit -m "Initial commit: Planificateur J.Moulin"
```

## Étape 2 : Créer un repo GitHub

1. Aller sur https://github.com/new
2. Nom: `planificateur-j-moulin`
3. Cliquer "Create repository"
4. Suivre les instructions pour pusher le code :

```bash
git remote add origin https://github.com/TON_USER/planificateur-j-moulin.git
git branch -M main
git push -u origin main
```

## Étape 3 : Connecter Railway à GitHub

1. Aller sur https://railway.app
2. "Create New Project"
3. Sélectionner "Deploy from GitHub repo"
4. Connecter ton compte GitHub si nécessaire
5. Sélectionner le repo `planificateur-j-moulin`
6. Cliquer "Deploy"

Railway va :
- Détecter SvelteKit automatiquement
- Commencer le build

⏳ **Le premier build prend 3-5 minutes**

## Étape 4 : Ajouter PostgreSQL

Dans le dashboard Railway :

1. Cliquer "+ Add Service"
2. Chercher "PostgreSQL"
3. Cliquer "PostgreSQL"
4. PostgreSQL est créée et ajoutée au projet

Railroad va ajouter `DATABASE_URL` automatiquement aux variables d'environnement ✅

## Étape 5 : Configurer les variables d'environnement

Dans Railway, dans l'onglet "Variables" de ton app SvelteKit :

### Ajouter :

1. **JWT_SECRET** (obligatoire)
   - Cliquer "Add Variable"
   - Nom: `JWT_SECRET`
   - Valeur: Générer une clé forte :
     ```bash
     openssl rand -hex 32
     ```
     Ou depuis Node.js :
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

2. **NODE_ENV** (optionnel, défaut: production)
   - Nom: `NODE_ENV`
   - Valeur: `production`

### Vérifier DATABASE_URL

La variable `DATABASE_URL` devrait être là automatiquement (ajoutée par le service PostgreSQL).

Pour vérifier : onglet "Variables" → tu dois voir `DATABASE_URL` 

Exemple : `postgresql://user:password@host:port/railway`

## Étape 6 : Configurer le port

Railway expose par défaut le port `3000`. Le Dockerfile le spécifie, c'est bon.

Tu peux vérifier dans "Settings" → "Port" → devrait être `3000`

## Étape 7 : Attendre le déploiement

Onglet "Deployments" → regarder les logs :

```
Building...
npm ci
npm run build
...
Successfully deployed! 🎉
```

Une fois "Success", l'app est live !

## Étape 8 : Accéder à l'app

Dans Railway, dans l'onglet "Environment" de ton app :

Tu verras une URL du type : `https://planificateur-j-moulin-production-xxxx.railway.app`

Clique dessus pour accéder à l'app !

## Étape 9 : Tester

1. Ouvrir l'URL
2. Créer un compte : **Admin** (premier compte = admin)
3. Te connecter
4. Tester : créer une tâche, un événement, etc.

## Variables d'environnement complètes

Après le setup, dans Railway tu dois avoir :

| Clé | Valeur | Source |
|-----|--------|--------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL (auto) |
| `JWT_SECRET` | `abc123...` | Manuel |
| `NODE_ENV` | `production` | Recommandé |

## Troubleshooting

### "Build failed" / "Railway couldn't detect the framework"

```bash
# Vérifier que ton package.json existe et a les bonnes scripts
npm run build  # Devrait marcher en local
```

### "DATABASE_URL missing"

1. Vérifier que PostgreSQL est ajoutée (onglet "Services")
2. Vérifier que la DB est "Connecting" ou "Running"
3. Attendre quelques secondes et recharger

### "Connection to DB failed"

```bash
# Vérifier les logs
railway logs
```

Chercher le message d'erreur exact. Souvent :
- `DATABASE_URL` mal formée
- PostgreSQL pas encore prête
- Migrations échouées

### "500 Internal Server Error"

```bash
# Regarder les logs en temps réel
railway logs -f
```

Chercher les erreurs dans les logs (rouge).

## Mise à jour du code

Après changements locaux :

```bash
git add .
git commit -m "Description du changement"
git push origin main
```

Railway va automatiquement :
1. Rebuild l'app
2. Redéployer
3. Pas de downtime (sauf si DB change)

## Next Steps

- [ ] Configurer un domaine personnalisé (Railway → Settings → Domain)
- [ ] Activer les backups PostgreSQL (Railway → DB → Backups)
- [ ] Ajouter monitoring (Railway → Metrics)
- [ ] Configurer les alertes (optionnel)

## Support

Si bloqué :
- Logs Railway : cliquer "View Logs" dans le déploiement
- Docs Railway : https://docs.railway.app
- Issues sur GitHub

Bon déploiement ! 🚀
