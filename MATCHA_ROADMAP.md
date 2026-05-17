# 🗺️ MATCHA — Roadmap Technique Multi-Dev
> Généré à partir de l'état réel du projet — Lead Dev Senior

---

## 1. 📊 État Actuel du Projet

### ✅ Terminé & Validé

| Module | Fichiers | Statut |
|---|---|---|
| Infrastructure Docker | `docker-compose.yml`, `Dockerfile` x2 | ✅ Production-ready |
| Schéma PostgreSQL complet | `database/init.sql` | ✅ Validé |
| Configuration backend TS | `tsconfig.json`, `package.json` | ✅ Validé |
| Connexion DB (Pool pg) | `config/db.ts` | ✅ Validé |
| Configuration Express + CORS | `app.ts` | ✅ Validé (cookie-parser en cours) |
| Nodemailer (Mailtrap dev) | `config/mailer.ts` | ✅ Validé |
| Utilitaires JWT | `utils/auth.utils.ts` | ✅ Validé |
| Erreurs custom | `utils/AppError.ts` | ✅ Validé |
| Inscription | route + controller + service | ✅ Testé & Validé |
| Vérification email | route + controller + service | ✅ Testé & Validé |
| Login + cookie JWT | route + controller + service | ✅ Testé & Validé |

### 🔄 Partiellement Fait

| Module | Ce qui manque |
|---|---|
| Auth flow | Logout + Middleware JWT + Reset password |
| `app.ts` | `cookie-parser` à ajouter |
| `types/index.ts` | Extension `req.user` à finaliser |

### ❌ Non commencé

- Profil utilisateur (CRUD)
- Upload de photos
- Géolocalisation
- Navigation / Suggestions de matching
- Recherche avancée
- Consultation de profils
- Système de likes / connexions
- Chat temps réel (WebSocket)
- Notifications temps réel
- Script de seed (500 profils)
- Frontend React (aucune page)
- Sécurité avancée (rate limiting, sanitization)

---

### ⚠️ Dette Technique Actuelle

| Dette | Niveau | Impact |
|---|---|---|
| Aucun rate limiting sur les routes auth | 🔴 Critique | Brute force possible |
| Pas de sanitization des inputs (XSS) | 🔴 Critique | Injection HTML/JS |
| `cookie-parser` pas encore dans app.ts | 🟡 Important | Login cookie non lu |
| Pas de validation centralisée (ex: Zod) | 🟡 Important | Duplication de code |
| Aucun test automatisé | 🟠 Moyen | Régression non détectée |
| Logs non structurés (console.log) | 🟠 Moyen | Debug difficile en prod |

### 🔴 Risques Techniques

1. **WebSocket + JWT** — authentifier les connexions WS est délicat, à anticiper tôt
2. **Upload photos** — stockage local dans Docker = données perdues si rebuild, prévoir un volume dédié
3. **Géolocalisation** — double logique GPS / saisie manuelle à bien isoler
4. **Algorithme de matching** — dépend de lat/lng, tags, fame_rating → peut devenir une query SQL complexe
5. **Seed 500 profils** — doit respecter toutes les contraintes (hash bcrypt x500 = lent)

---

## 2. 🧩 Découpage en Modules Indépendants

```
┌─────────────────────────────────────────────────────────┐
│                    MODULES DU PROJET                    │
├──────────────┬──────────────┬──────────────┬───────────┤
│   AUTH       │   PROFIL     │  MATCHING    │  REALTIME │
│  (backend)   │  (back+front)│  (back+front)│  (WS)     │
├──────────────┼──────────────┼──────────────┼───────────┤
│  PHOTOS      │  RECHERCHE   │   FRONTEND   │   SEED    │
│  (upload)    │  (back+front)│   (React)    │  (script) │
└──────────────┴──────────────┴──────────────┴───────────┘
```

### Dépendances entre modules

```
AUTH ──────────────────────────────► tout le reste (bloquant)
      │
      ▼
PROFIL ────────────────────────────► PHOTOS
      │
      ▼
MATCHING ──────────────────────────► LIKES ──► CHAT (WebSocket)
      │                                          │
      ▼                                          ▼
RECHERCHE                               NOTIFICATIONS (WebSocket)

FRONTEND ──── dépend de toutes les APIs backend
SEED ──────── dépend de AUTH + PROFIL + PHOTOS
```

### Modules parallélisables

| Peut être fait en parallèle | Condition |
|---|---|
| Frontend Auth pages + Backend Auth finalisation | API contrat défini |
| Backend Profil + Frontend structure/layout | Oui |
| Script Seed + Backend Matching | Oui |
| Backend Chat WS + Frontend Chat UI | Oui |

---

## 3. 👥 Plan Multi-Développeurs

### Répartition recommandée

```
DEV A — Backend Lead
DEV B — Frontend Lead (+ backend features simples)
```

### DEV A — Responsabilités

- Finaliser auth (logout, middleware, reset password)
- Toutes les routes backend (profil, photos, matching, recherche)
- WebSocket server (chat + notifications)
- Sécurité backend (rate limiting, sanitization, validation)
- Script de seed
- Requêtes SQL complexes (matching, recherche)

### DEV B — Responsabilités

- Toute l'application React (pages, composants, routing)
- Intégration des APIs (appels fetch/axios)
- UI/UX responsive
- Gestion état frontend (context ou zustand)
- Upload photos côté client
- Géolocalisation côté client (navigator.geolocation)
- WebSocket client (chat + notifications UI)

### ⚠️ Zones de coordination obligatoire

| Zone | Action requise |
|---|---|
| Contrat d'API (URLs, payloads, réponses) | Définir AVANT de coder les deux côtés |
| Types TypeScript partagés | Centraliser dans `types/index.ts` |
| Gestion des erreurs (format JSON uniforme) | Décider ensemble du format `{ message, code }` |
| Auth middleware | DEV A livre en priorité, DEV B l'intègre ensuite |

### Stratégie Git

```
main
 └── develop                    ← branche d'intégration
      ├── feature/auth-logout   ← DEV A
      ├── feature/auth-reset    ← DEV A
      ├── feature/profile-api   ← DEV A
      ├── feature/frontend-auth ← DEV B
      ├── feature/frontend-profile ← DEV B
      └── ...
```

**Conventions de commits :**
```
feat(auth): add logout endpoint
fix(profile): correct nullable city field
chore(db): add index on likes table
refactor(service): extract email logic to utils
```

**Règles PR :**
- Toute PR doit être relue par l'autre dev avant merge sur `develop`
- Jamais de push direct sur `main` ou `develop`
- Les fichiers `init.sql`, `docker-compose.yml`, `.env.example` nécessitent validation des deux devs

---

## 4. 🗓️ Roadmap par Phases

### Phase 1 — Finalisation Auth *(1 semaine)*

**Priorité : 🔴 BLOQUANTE pour tout le reste**

| Tâche | Dev | Complexité |
|---|---|---|
| `cookie-parser` dans app.ts | A | Trivial |
| Extension `req.user` TypeScript | A | Facile |
| Middleware JWT (`auth.middleware.ts`) | A | Moyen |
| `POST /logout` | A | Facile |
| `POST /forgot-password` | A | Moyen |
| `POST /reset-password/:token` | A | Moyen |
| Page Login React | B | Moyen |
| Page Register React | B | Moyen |
| Page Verify Email React | B | Facile |
| Routing protégé React (PrivateRoute) | B | Moyen |

**Fichiers impactés :**
- `app.ts`, `types/index.ts`
- `middlewares/auth.middleware.ts`
- `routes/auth.routes.ts`, `controllers/auth.controller.ts`, `services/auth.service.ts`
- Frontend : `pages/Login.tsx`, `pages/Register.tsx`, `pages/Verify.tsx`

---

### Phase 2 — Profil Utilisateur *(1-2 semaines)*

**Priorité : 🔴 Haute**

| Tâche | Dev | Complexité |
|---|---|---|
| `GET /api/users/me` (profil courant) | A | Facile |
| `PUT /api/users/me` (mise à jour profil) | A | Moyen |
| Upload photos (max 5, 1 profil) | A | Difficile |
| Volume Docker pour photos | A | Moyen |
| Géolocalisation GPS + fallback manuel | A | Moyen |
| Tags CRUD (ajouter/supprimer) | A | Moyen |
| Page Profil React (affichage) | B | Moyen |
| Page Édition Profil React | B | Difficile |
| Composant Upload Photos (drag & drop) | B | Difficile |
| Composant Tags (input autocomplete) | B | Moyen |

**Fichiers impactés :**
- `routes/user.routes.ts` *(nouveau)*
- `controllers/user.controller.ts` *(nouveau)*
- `services/user.service.ts` *(nouveau)*
- `middlewares/upload.middleware.ts` *(nouveau — multer)*
- Frontend : `pages/Profile.tsx`, `pages/EditProfile.tsx`

**Risques :**
- Photos stockées dans Docker → prévoir volume persistant dans `docker-compose.yml`
- GPS nécessite HTTPS en production → gérer le fallback proprement

---

### Phase 3 — Matching & Navigation *(1-2 semaines)*

**Priorité : 🟡 Haute**

| Tâche | Dev | Complexité |
|---|---|---|
| Algorithme de suggestions (SQL complexe) | A | Difficile |
| `GET /api/users/suggestions` | A | Difficile |
| Calcul distance géographique (Haversine) | A | Moyen |
| Fame rating logic | A | Moyen |
| `POST /api/likes/:userId` | A | Moyen |
| `DELETE /api/likes/:userId` (unlike) | A | Facile |
| Détection match mutuel | A | Moyen |
| Page Découverte React (cards de profils) | B | Difficile |
| Composant carte profil | B | Moyen |
| Bouton like / unlike avec feedback | B | Moyen |
| Filtres et tri UI | B | Difficile |

**Fichiers impactés :**
- `routes/likes.routes.ts` *(nouveau)*
- `services/matching.service.ts` *(nouveau)*
- `utils/haversine.ts` *(nouveau — calcul distance)*
- Frontend : `pages/Discover.tsx`, `components/ProfileCard.tsx`

---

### Phase 4 — Recherche Avancée *(1 semaine)*

**Priorité : 🟡 Moyenne**

| Tâche | Dev | Complexité |
|---|---|---|
| `GET /api/search` avec filtres query params | A | Moyen |
| Requête SQL dynamique avec filtres | A | Difficile |
| Page Recherche React | B | Moyen |
| Composant Filtres (âge, localisation, tags, fame) | B | Moyen |

---

### Phase 5 — Temps Réel : Chat + Notifications *(2 semaines)*

**Priorité : 🟡 Haute — Feature signature du projet**

| Tâche | Dev | Complexité |
|---|---|---|
| Serveur WebSocket (ws ou socket.io) | A | Difficile |
| Auth JWT sur connexion WS | A | Difficile |
| Table `messages` en DB | A | Facile |
| Logique chat (envoyer/recevoir/historique) | A | Difficile |
| Système de notifications (5 événements) | A | Difficile |
| Client WebSocket React | B | Difficile |
| Page Chat React | B | Difficile |
| Composant Notifications (badge + liste) | B | Moyen |
| Indicateur "en ligne" / "dernière connexion" | B | Moyen |

**Table DB à ajouter dans `init.sql` :**
```sql
messages:
- id SERIAL PK
- sender_id FK → users
- receiver_id FK → users
- content TEXT NOT NULL
- is_read BOOLEAN DEFAULT false
- sent_at TIMESTAMPTZ DEFAULT NOW()
```

---

### Phase 6 — Sécurité & Finitions *(1 semaine)*

**Priorité : 🔴 Obligatoire avant soutenance**

| Tâche | Dev | Complexité |
|---|---|---|
| Rate limiting (express-rate-limit) | A | Facile |
| Sanitization inputs (DOMPurify ou helmet) | A | Moyen |
| Helmet.js (headers sécurité HTTP) | A | Facile |
| Validation centralisée (Zod) | A | Moyen |
| Blocage / Signalement complets | A | Moyen |
| Historique de visites profil | A | Facile |
| Script seed 500 profils | A | Difficile |
| Responsive mobile frontend | B | Moyen |
| Header / Footer sur toutes les pages | B | Facile |
| Tests manuels complets | A+B | Difficile |

---

## 5. 🏗️ Architecture de Collaboration

### Structure branches Git

```
main              ← production uniquement, tags de version
develop           ← intégration continue, toujours stable
feature/*         ← nouvelles features (merge vers develop)
fix/*             ← corrections de bugs
chore/*           ← maintenance (deps, config, docker)
```

### Conventions de nommage

**Branches :**
```
feature/auth-logout
feature/profile-api
feature/frontend-login
fix/cookie-missing-await
chore/update-docker-compose
```

**Fichiers backend :**
```
*.routes.ts       ← déclaration routes uniquement
*.controller.ts   ← validation HTTP + appel service
*.service.ts      ← logique métier + DB
*.middleware.ts   ← middlewares Express
*.utils.ts        ← fonctions utilitaires pures
```

**Fichiers frontend :**
```
pages/            ← pages complètes (une par route)
components/       ← composants réutilisables
hooks/            ← custom hooks React
services/         ← appels API (fetch/axios)
context/          ← état global (auth, notifications)
types/            ← interfaces TypeScript partagées
```

---

## 6. ⚠️ Zones Critiques

### 🔴 Sous contrôle d'un seul dev (jamais en parallèle)

| Fichier | Raison |
|---|---|
| `database/init.sql` | Conflits de schéma = DB corrompue |
| `docker-compose.yml` | Changements affectent tout le monde |
| `app.ts` | Configuration centrale Express |
| `types/index.ts` | Types partagés front+back |
| `middlewares/auth.middleware.ts` | Sécurité critique |

### 🟡 Risques de régression élevés

- Modifier la table `users` en SQL → tous les services impactés
- Changer le format du JWT payload → middleware + frontend cassés
- Modifier le système de cookies → toute l'auth cassée
- Ajouter des colonnes NOT NULL sans valeur DEFAULT → seed cassé

---

## 7. 📅 Plan d'Exécution Semaine par Semaine

### Semaine 1 — Finalisation Auth + Fondations Frontend

```
DEV A :
  ✓ cookie-parser + req.user TypeScript
  ✓ Middleware JWT
  ✓ POST /logout
  ✓ POST /forgot-password + POST /reset-password
  ✓ Sécurité basique (helmet, rate-limit auth routes)

DEV B :
  ✓ Setup React Router (react-router-dom)
  ✓ Context Auth (user connecté, token)
  ✓ Pages Login + Register + VerifyEmail
  ✓ PrivateRoute (redirect si non connecté)
  ✓ Layout de base (Header + Footer + Main)
```

### Semaine 2 — Profil Utilisateur

```
DEV A :
  ✓ GET + PUT /api/users/me
  ✓ Upload photos (multer + volume Docker)
  ✓ Géolocalisation (GPS + fallback)
  ✓ Tags API (add/remove)

DEV B :
  ✓ Page profil (affichage)
  ✓ Page édition profil
  ✓ Composant upload photos
  ✓ Composant tags (autocomplete)
```

### Semaine 3 — Matching + Consultation profils

```
DEV A :
  ✓ GET /api/users/suggestions (algo complet)
  ✓ GET /api/users/:id (profil public)
  ✓ POST + DELETE /api/likes/:userId
  ✓ Détection match mutuel
  ✓ Historique de visites

DEV B :
  ✓ Page Découverte (liste suggestions)
  ✓ Composant ProfileCard
  ✓ Page profil public
  ✓ Boutons like/unlike/block/report
```

### Semaine 4 — Recherche + Temps réel

```
DEV A :
  ✓ GET /api/search avec filtres
  ✓ Serveur WebSocket + auth JWT WS
  ✓ Logique chat + table messages
  ✓ Système notifications (5 events)

DEV B :
  ✓ Page Recherche + composant filtres
  ✓ Client WebSocket React
  ✓ Page Chat
  ✓ Composant Notifications (badge)
```

### Semaine 5 — Finitions + Seed + Sécurité

```
DEV A :
  ✓ Script seed 500 profils
  ✓ Sécurité complète (sanitization, validation Zod)
  ✓ Blocage / Signalement
  ✓ Fame rating dynamique

DEV B :
  ✓ Responsive mobile complet
  ✓ Polishing UI/UX
  ✓ Gestion erreurs frontend
  ✓ Tests manuels end-to-end
```

### Semaine 6 — Buffer + Tests + Soutenance

```
DEV A + DEV B :
  ✓ Tests complets de toutes les features
  ✓ Correction des bugs trouvés
  ✓ Vérification sécurité (injection SQL, XSS, CSRF)
  ✓ Vérification console (0 erreur, 0 warning)
  ✓ Démo préparation
```

---

## 8. 📋 Checklist Soutenance

### Sécurité (éliminatoire)
- [ ] Mots de passe hashés (bcrypt ✅)
- [ ] Pas d'injection SQL (requêtes paramétrées ✅)
- [ ] Validation tous les inputs
- [ ] Pas de XSS (sanitization)
- [ ] Pas de données sensibles dans les réponses API
- [ ] `.env` non commité ✅
- [ ] CORS configuré ✅

### Fonctionnel
- [ ] Inscription + vérification email ✅
- [ ] Login / Logout
- [ ] Profil complet (genre, préférences, bio, tags, photos)
- [ ] Géolocalisation (GPS + fallback)
- [ ] Suggestions intelligentes
- [ ] Recherche avancée avec filtres
- [ ] Like / Unlike / Match
- [ ] Chat temps réel (< 10 secondes)
- [ ] Notifications temps réel (< 10 secondes)
- [ ] Blocage / Signalement
- [ ] Historique de visites
- [ ] Fame rating
- [ ] 500 profils en DB

### Technique
- [ ] 0 erreur console côté serveur
- [ ] 0 erreur console côté client
- [ ] Compatible Firefox + Chrome dernières versions
- [ ] Responsive mobile
- [ ] Header + Main + Footer sur toutes les pages
