# Trouve ton artisan — Région Auvergne-Rhône-Alpes

> Devoir bilan CEF — Création d'une plateforme web permettant aux particuliers de
> trouver un artisan dans la région Auvergne-Rhône-Alpes et de le contacter via
> un formulaire de contact.

## Sommaire

1. [Aperçu](#aperçu)
2. [Architecture du projet](#architecture-du-projet)
3. [Prérequis](#prérequis)
4. [Installation](#installation)
5. [Lancement en développement](#lancement-en-développement)
6. [Build et déploiement](#build-et-déploiement)
7. [Endpoints de l'API](#endpoints-de-lapi)
8. [Sécurité](#sécurité)
9. [Accessibilité et responsive](#accessibilité-et-responsive)
10. [Liens utiles](#liens-utiles)

## Aperçu

- **Frontend** : React 18 + Vite + Bootstrap 5 + Sass — mobile-first, WCAG 2.1.
- **API** : Node.js + Express + Sequelize.
- **Base de données** : MySQL 8 / MariaDB 10.
- **Authentification API** : clé partagée (`x-api-key`) entre le front et l'API.
- **Hébergement** : Vercel (front) + Render (API) + Aiven (MySQL) (suggéré).

## Architecture du projet

```text
trouve-ton-artisan/
├── backend/              # API Express + Sequelize
│   ├── src/
│   │   ├── config/       # env + connexion Sequelize
│   │   ├── controllers/  # logique métier
│   │   ├── middlewares/  # apiKey, validation, erreurs
│   │   ├── models/       # Category / Specialty / Artisan / ContactMessage
│   │   ├── routes/       # routes Express
│   │   ├── services/     # mailer (Nodemailer)
│   │   ├── scripts/      # outils en ligne de commande
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── database/             # Scripts SQL
│   ├── 01_schema.sql     # création de la BDD et des tables
│   └── 02_seed.sql       # jeu d'essai (17 artisans, 15 spécialités, 4 catégories)
│
├── frontend/             # Application React
│   ├── src/
│   │   ├── api/          # client HTTP vers l'API
│   │   ├── components/   # Header, Footer, Layout, ArtisanCard, Rating…
│   │   ├── pages/        # HomePage, ArtisansListPage, ArtisanDetailPage, …
│   │   ├── styles/       # Sass (variables + main)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── index.html
│   └── package.json
│
├── docs/                 # Documents techniques (MCD/MLD, sécurité, veille)
└── README.md             # Vous êtes ici
```

## Prérequis

| Outil          | Version minimale | Vérifier avec    |
|----------------|------------------|------------------|
| Node.js        | 18.x             | `node -v`        |
| npm            | 9.x              | `npm -v`         |
| MySQL/MariaDB  | 8.x / 10.x       | `mysql --version`|
| Git            | 2.30+            | `git --version`  |

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-user>/trouve-ton-artisan.git
cd trouve-ton-artisan

# 2. Créer la base et l'alimenter (Linux/macOS/Git Bash)
mysql -u root -p < database/01_schema.sql
mysql -u root -p < database/02_seed.sql

# Sous Windows PowerShell, contourner la conversion d'encodage UTF-8 :
# cmd /c '"C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < "database\01_schema.sql"'
# cmd /c '"C:\xampp\mysql\bin\mysql.exe" -u root --default-character-set=utf8mb4 < "database\02_seed.sql"'

# 3. Créer un utilisateur dédié à l'application (recommandé)
mysql -u root -p <<'SQL'
CREATE USER 'ttartisan_app'@'localhost' IDENTIFIED BY 'mot_de_passe_fort';
GRANT SELECT, INSERT, UPDATE, DELETE ON trouve_ton_artisan.* TO 'ttartisan_app'@'localhost';
FLUSH PRIVILEGES;
SQL

# 4. Backend
cd backend
cp .env.example .env       # adapter les valeurs (DB, API_KEY, SMTP, CORS)
npm install

# 5. Frontend
cd ../frontend
cp .env.example .env       # adapter VITE_API_URL et VITE_API_KEY (= API_KEY)
npm install
```

> ⚠️ La valeur de `API_KEY` (backend) **doit être identique** à `VITE_API_KEY` (frontend).
> Choisissez une chaîne aléatoire de 32 caractères ou plus (par exemple via
> `openssl rand -hex 32`).

## Lancement en développement

Dans deux terminaux séparés :

```bash
# Terminal 1 : API
cd backend
npm run dev          # http://localhost:4000

# Terminal 2 : Frontend
cd frontend
npm run dev          # http://localhost:5173
```

Test rapide de la connexion à la base :

```bash
cd backend
npm run db:test
# -> { categories: 4, specialties: 15, artisans: 17 }
```

## Build et déploiement

```bash
# Frontend (production)
cd frontend
npm run build        # génère ./dist

# Backend
cd ../backend
NODE_ENV=production npm start
```

Suggestions d'hébergement gratuit/peu coûteux :

- **Frontend** : Vercel ou Netlify (déploiement automatique depuis GitHub).
- **API** : Render ou Railway (Node.js).
- **BDD** : Aiven, Railway ou PlanetScale (MySQL managé).

Variables d'environnement à définir côté plateforme (mêmes noms que `.env.example`).

## Endpoints de l'API

Tous les endpoints (sauf `/health`) requièrent l'en-tête `x-api-key`.

| Méthode | URL                                | Description                                       |
|---------|------------------------------------|---------------------------------------------------|
| GET     | `/api/health`                      | Santé du service (public)                         |
| GET     | `/api/categories`                  | Liste des 4 catégories (menu du header)           |
| GET     | `/api/categories/:id`              | Détail d'une catégorie + ses spécialités          |
| GET     | `/api/artisans`                    | Liste des artisans (`?category=…&q=…`)            |
| GET     | `/api/artisans/top-of-month`       | Les 3 artisans du mois (page d'accueil)           |
| GET     | `/api/artisans/:id`                | Fiche complète d'un artisan                       |
| POST    | `/api/artisans/:id/contact`        | Envoi du formulaire de contact (`name`, `email`, `subject`, `message`) |

## Sécurité

Mesures mises en place :

- **Clé d'API** (`x-api-key`) obligatoire pour toutes les routes métier
  → restreint l'accès de l'API à l'application frontend.
- **CORS allowlist** → seules les origines explicitement listées (frontend) sont autorisées.
- **Helmet** → en-têtes HTTP de sécurité (X-Frame-Options, Referrer-Policy, etc.).
- **Rate limiting** → 100 req / 15 min globalement, 5 req / 15 min pour le formulaire de contact.
- **Validation `express-validator`** → nettoyage et contrôle de tous les paramètres en entrée.
- **Sequelize (requêtes paramétrées)** → protection native contre l'injection SQL.
- **Utilisateur BDD à privilèges réduits** → l'API n'a que les droits CRUD nécessaires.
- **Variables d'environnement** → aucun secret en clair dans le code (`.env` jamais commité).
- **HTTPS obligatoire** en production (terminaison TLS gérée par l'hébergeur).
- **Comparaison à temps constant** de la clé d'API (anti-timing attack).

Détails complets dans [`docs/SECURITE.md`](docs/SECURITE.md).

## Accessibilité et responsive

- Conception **mobile-first** (breakpoints Bootstrap : `sm`, `md`, `lg`, `xl`).
- Conformité **WCAG 2.1** visée (contraste, labels explicites, focus visible, ordre logique).
- Lien d'évitement (skip link) vers le contenu principal.
- Sémantique HTML correcte (`<header>`, `<main>`, `<nav>`, `<footer>`, `<address>`, etc.).
- Navigation au clavier complète, attributs ARIA quand nécessaire.
- Composant `<Rating>` accessible (étoiles visuelles + valeur textuelle lue par les lecteurs d'écran).
- Titres et meta-descriptions par page (référencement SEO via `react-helmet-async`).

## Liens utiles

- **Brief de la mission** : `Brief de la mission.pdf` (CEF).
- **Maquettes Figma** : <https://www.figma.com/file/XXXX/trouve-ton-artisan> (à compléter).
- **Site en ligne** : <https://trouve-ton-artisan.vercel.app/> (à compléter après déploiement).
- **API en ligne** : <https://trouve-ton-artisan-api.onrender.com/api/health> (à compléter).

---

© 2026 — Région Auvergne-Rhône-Alpes / Devoir bilan CEF — Sylvain Labeye.
