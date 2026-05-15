# Veille de sécurité — Trouve ton artisan

Veille effectuée tout au long du projet pour identifier les vulnérabilités
courantes et vérifier que les bonnes pratiques sont appliquées.

## 1. Sources surveillées

| Source                                       | Pourquoi                                            |
|----------------------------------------------|-----------------------------------------------------|
| [OWASP Top 10](https://owasp.org/Top10/)     | Référence des vulnérabilités web                    |
| [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/) | Recettes de mise en œuvre               |
| [Snyk Vulnerability DB](https://security.snyk.io/) | CVE des packages npm                          |
| [GitHub Security Advisories](https://github.com/advisories) | Failles connues sur les dépendances    |
| [CNIL — RGPD](https://www.cnil.fr/)          | Données personnelles (formulaire de contact)        |
| [W3C — WCAG 2.1](https://www.w3.org/TR/WCAG21/) | Accessibilité (cf. brief)                        |
| [MDN Web Docs](https://developer.mozilla.org/) | Bonnes pratiques HTML/CSS/JS                      |

## 2. Vulnérabilités OWASP étudiées et mesures appliquées

### A01:2021 – Broken Access Control
- **Risque** : un utilisateur peut accéder à une ressource non autorisée.
- **Mesure** : authentification par clé d'API obligatoire ; aucune route ne
  donne accès à des données d'administration ; pas de session.

### A02:2021 – Cryptographic Failures
- **Risque** : transport non chiffré, secrets en clair.
- **Mesure** : HTTPS obligatoire en production (TLS terminé par l'hébergeur),
  secrets stockés en variables d'environnement, comparaison de clé à temps
  constant (`crypto.timingSafeEqual`).

### A03:2021 – Injection
- **Risque** : injection SQL ou de commande.
- **Mesure** : utilisation exclusive de Sequelize (requêtes paramétrées),
  validation et nettoyage de toutes les entrées via `express-validator`.

### A04:2021 – Insecure Design
- **Risque** : mauvaise conception (workflows non sécurisés).
- **Mesure** : modèle de données simple et contraint (clés étrangères, CHECK,
  UNIQUE), parcours utilisateur minimaliste, principe du moindre privilège
  pour le compte BDD.

### A05:2021 – Security Misconfiguration
- **Risque** : valeurs par défaut, en-têtes manquants, debug en production.
- **Mesure** : Helmet, désactivation de `x-powered-by`, mode `production`
  forcé pour Express, `errorHandler` qui masque les détails en prod.

### A06:2021 – Vulnerable and Outdated Components
- **Risque** : dépendances vulnérables.
- **Mesure** : `npm audit` régulier, versions récentes des packages (Express 4,
  Sequelize 6, React 18). Veille via GitHub Dependabot recommandée sur le
  dépôt distant.

### A07:2021 – Identification and Authentication Failures
- **Risque** : brute force, énumération.
- **Mesure** : pas de système de mot de passe utilisateur (pas d'espace
  membre), clé d'API longue et aléatoire, rate limiting sur toutes les routes.

### A08:2021 – Software and Data Integrity Failures
- **Risque** : utilisation de packages compromis.
- **Mesure** : fichier `package-lock.json` versionné, sources officielles npm
  uniquement, scripts de build sans dépendances inutiles.

### A09:2021 – Security Logging and Monitoring Failures
- **Risque** : absence de traces en cas d'incident.
- **Mesure** : Morgan en logs HTTP, journalisation des erreurs serveur,
  traçabilité des messages de contact en BDD.

### A10:2021 – Server-Side Request Forgery (SSRF)
- **Risque** : URL fournies par l'utilisateur qui déclenchent des requêtes
  vers des cibles internes.
- **Mesure** : l'API ne fait aucun appel sortant à partir de données
  utilisateur ; les URL des sites d'artisans ne sont qu'affichées.

## 3. Vulnérabilités vérifiées sur le projet

| Test                                       | Méthode                                    | Résultat                                          |
|--------------------------------------------|---------------------------------------------|---------------------------------------------------|
| Injection SQL dans `?q=`                   | Envoi de payload `' OR 1=1 --`              | Sans effet (Sequelize paramétré)                  |
| XSS via formulaire de contact              | Envoi de `<script>alert(1)</script>`        | Stocké en texte, jamais évalué (pas de `dangerouslySetInnerHTML`) |
| Accès à l'API sans clé                     | `curl` direct sans `x-api-key`              | Réponse `401 Unauthorized`                        |
| Accès depuis une autre origine             | Requête depuis un domaine non listé         | Bloqué par CORS                                   |
| Spam du formulaire                         | 10 envois rapides depuis la même IP         | Bloqué après le 5ᵉ envoi (rate limit)             |
| Payload géant                              | `POST` JSON > 32 ko                         | Refusé (`PayloadTooLargeError`)                   |
| `npm audit` (front + back)                 | `npm audit --omit=dev`                      | Aucune vuln. critique au moment du rendu          |

## 4. Vulnérabilités corrigées en cours de développement

- **Affichage XSS potentiel sur le nom de l'artisan** : le rendu se fait par
  React (échappement automatique). Aucun emploi de `dangerouslySetInnerHTML`.
- **Comparaison naïve de la clé d'API** : remplacée par une comparaison à
  temps constant (`crypto.timingSafeEqual`).
- **Route 404 par défaut** : ajout d'un handler explicite pour éviter qu'une
  route inexistante n'expose la stack Express.
- **Fuite de la version d'Express** : `app.disable('x-powered-by')`.

## 5. Bonnes pratiques RGPD / Données personnelles

- **Minimisation** : seuls les champs strictement utiles sont collectés
  (nom, e-mail, objet, message).
- **Finalité** : le formulaire sert uniquement à transmettre le message à
  l'artisan ; pas d'envoi marketing.
- **Conservation** : les messages sont conservés à des fins de traçabilité ;
  une politique de purge automatique (ex. 12 mois) pourra être ajoutée.
- **Information** : la page « Données personnelles » sera complétée par un
  cabinet spécialisé.
- **Droit d'accès / rectification / suppression** : un contact via le
  formulaire dédié de la page « Données personnelles » est prévu.

## 6. Sources consultées pendant le projet

- OWASP Top 10 2021 — synthèse + cheatsheets.
- Documentation officielle de `helmet`, `cors`, `express-rate-limit`,
  `express-validator`, `sequelize`.
- MDN Web Docs : `Content-Security-Policy`, `Strict-Transport-Security`.
- Article CNIL « Sécuriser un site web ».
- WCAG 2.1 (Understanding) — Success Criteria 1.4.3 (contrastes),
  2.4.1 (lien d'évitement), 2.4.7 (focus visible).
