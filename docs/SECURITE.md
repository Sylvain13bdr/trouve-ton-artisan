# Sécurité — Trouve ton artisan

Ce document détaille les mesures de sécurité mises en place dans le projet,
leur mise en œuvre et leur intérêt.

## 1. Restriction de l'accès à l'API par clé partagée

**Mise en œuvre.**
Toutes les routes métier (`/api/categories/*`, `/api/artisans/*`) sont protégées
par un middleware (`backend/src/middlewares/apiKey.js`) qui vérifie la présence
et la validité de l'en-tête HTTP `x-api-key`. La comparaison est effectuée à
temps constant via `crypto.timingSafeEqual` pour éviter les attaques par
timing.

**Intérêt.**
Le brief impose que l'API soit utilisée uniquement par l'application web. Cette
clé empêche un tiers de consommer librement l'API ou d'envoyer des messages de
contact en automatisé. La clé est stockée côté serveur et côté client uniquement
dans des variables d'environnement (jamais en clair dans le code source).

## 2. Politique CORS restrictive

**Mise en œuvre.**
Le middleware `cors` n'autorise que les origines explicitement listées dans la
variable d'environnement `CORS_ORIGIN`. Les méthodes sont limitées à
`GET` et `POST`, les en-têtes à `Content-Type` et `x-api-key`.

**Intérêt.**
Empêche les sites tiers d'invoquer l'API depuis un navigateur. Combiné à la clé
d'API, c'est une double barrière à l'usage non autorisé.

## 3. En-têtes HTTP de sécurité (Helmet)

**Mise en œuvre.**
Le middleware `helmet` est utilisé sur toute l'API. Il pose notamment :
`X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control: off`,
`Referrer-Policy: no-referrer`, `Strict-Transport-Security` (en HTTPS).

**Intérêt.**
Bouchon les défauts de configuration HTTP les plus connus :
sniffing MIME, leak de referrer, downgrade HTTPS → HTTP, etc.

## 4. Limitation de débit (rate limiting)

**Mise en œuvre.**
- Limite globale : 100 requêtes par 15 minutes et par IP (`express-rate-limit`).
- Limite spécifique sur `POST /api/artisans/:id/contact` : 5 messages par
  15 minutes et par IP.

**Intérêt.**
Empêche les abus du formulaire de contact (spam d'artisans) et les attaques par
force brute sur la clé d'API.

## 5. Validation et nettoyage des entrées

**Mise en œuvre.**
`express-validator` côté serveur (longueur, type, format e-mail, URL…) et
validation client (HTML5 + JS) sur les formulaires. Les paramètres de route
sont contraints par regex (`(\d+)`).

**Intérêt.**
Évite que des données malformées atteignent la BDD ou le moteur de templates,
prévient les attaques de type XSS stocké et les injections de logique métier.

## 6. Protection contre l'injection SQL

**Mise en œuvre.**
Tous les accès à la BDD passent par **Sequelize** (ORM) qui produit des
requêtes paramétrées. Aucun assemblage manuel de chaînes SQL n'est utilisé.

**Intérêt.**
Garantit que les valeurs envoyées par l'utilisateur ne peuvent pas être
interprétées comme du code SQL.

## 7. Compte de base de données à privilèges réduits

**Mise en œuvre.**
Le compte applicatif (`ttartisan_app`) ne possède que les droits
`SELECT, INSERT, UPDATE, DELETE` sur la base `trouve_ton_artisan`. Aucune
permission `GRANT`, `DROP` ou administrateur.

**Intérêt.**
Limite l'impact d'une éventuelle compromission de la chaîne applicative.

## 8. Secrets en variables d'environnement

**Mise en œuvre.**
Identifiants BDD, clé d'API, identifiants SMTP : tous lus depuis `process.env`
via `dotenv`. Le fichier `.env` est exclu via `.gitignore`. Un fichier
`.env.example` documente les variables attendues.

**Intérêt.**
Aucune fuite de secret via le dépôt Git ; rotation des secrets sans toucher
au code.

## 9. HTTPS obligatoire en production

**Mise en œuvre.**
Le déploiement passe par un hébergeur (Render/Vercel) qui fournit le
certificat TLS. L'en-tête `Strict-Transport-Security` est ajouté par Helmet.

**Intérêt.**
Confidentialité et intégrité des échanges, notamment des données du
formulaire de contact.

## 10. Taille maximale du corps des requêtes

**Mise en œuvre.**
`express.json({ limit: '32kb' })` : le serveur refuse les payloads JSON
au-delà de 32 ko.

**Intérêt.**
Protection basique contre les attaques par déni de service par grosses charges.

## 11. Gestion d'erreurs centralisée

**Mise en œuvre.**
Un middleware (`errorHandler`) attrape toutes les exceptions, journalise
côté serveur et renvoie au client un message générique en production
(le détail technique reste visible uniquement en environnement de dev).

**Intérêt.**
Évite la divulgation d'informations sensibles (stack trace, schéma BDD)
via les messages d'erreur.

## 12. Journalisation des messages de contact

**Mise en œuvre.**
Chaque envoi du formulaire est enregistré dans la table `contact_messages`
(date, expéditeur, destinataire, objet, message).

**Intérêt.**
Traçabilité en cas d'incident (spam, abus, réclamation), sans pour autant
exposer ces données via l'API.

## Synthèse

| Mesure                       | Couche       | Outil                  |
|------------------------------|--------------|------------------------|
| Authentification frontend↔API| API          | Clé partagée           |
| CORS restreint               | API          | `cors`                 |
| En-têtes HTTP                | API          | `helmet`               |
| Rate limiting                | API          | `express-rate-limit`   |
| Validation des entrées       | API & Front  | `express-validator`    |
| Anti-injection SQL           | Données      | Sequelize (ORM)        |
| Privilèges BDD réduits       | Données      | `GRANT` minimal        |
| Secrets hors du code         | Build/Deploy | `dotenv` + `.gitignore`|
| HTTPS                        | Réseau       | Hébergeur (TLS)        |
| Taille des requêtes          | API          | `express.json`         |
| Gestion d'erreurs            | API          | Middleware central     |
| Traçabilité des contacts     | Données      | Table `contact_messages` |
