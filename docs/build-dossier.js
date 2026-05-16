/**
 * Génère le dossier de rendu .docx du devoir « Trouve ton artisan ».
 * Exécution : node build-dossier.js
 *
 * Prérequis : `npm install -g docx` ou `npm install docx` dans ce dossier.
 *
 * Le fichier généré (dossier-trouve-ton-artisan.docx) peut ensuite être
 * ouvert dans Word/LibreOffice pour :
 *  - insérer les captures Figma à la place des placeholders,
 *  - mettre à jour le sommaire (clic droit > « Mettre à jour les champs »),
 *  - exporter en PDF (Fichier > Exporter au format PDF).
 */

const fs = require('fs');
const path = require('path');
const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    Header,
    Footer,
    AlignmentType,
    PageOrientation,
    LevelFormat,
    ExternalHyperlink,
    TabStopType,
    TabStopPosition,
    HeadingLevel,
    BorderStyle,
    WidthType,
    ShadingType,
    TableOfContents,
    PageBreak,
    PageNumber,
    VerticalAlign,
} = require('docx');

// -------- Helpers ---------------------------------------------------------

const COLOR_PRIMARY = '0074C7';
const COLOR_DARK = '384050';
const COLOR_LIGHT = 'F1F8FC';
const COLOR_BORDER = 'D0D7DE';

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 180 },
        children: [new TextRun({ text, bold: true })],
    });
}

function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text, bold: true })],
    });
}

function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ text, bold: true })],
    });
}

function p(text, opts = {}) {
    return new Paragraph({
        spacing: { after: 120 },
        alignment: opts.alignment || AlignmentType.JUSTIFIED,
        children: [new TextRun({ text, ...opts.run })],
    });
}

function bullet(text, level = 0) {
    return new Paragraph({
        numbering: { reference: 'bullets', level },
        spacing: { after: 80 },
        children: [new TextRun(text)],
    });
}

function numbered(text, level = 0) {
    return new Paragraph({
        numbering: { reference: 'numbers', level },
        spacing: { after: 80 },
        children: [new TextRun(text)],
    });
}

function code(text) {
    return new Paragraph({
        spacing: { after: 120 },
        shading: { type: ShadingType.CLEAR, fill: COLOR_LIGHT },
        children: [new TextRun({ text, font: 'Consolas', size: 20 })],
    });
}

function link(label, url) {
    return new ExternalHyperlink({
        link: url,
        children: [new TextRun({ text: label, style: 'Hyperlink' })],
    });
}

function pWithLink(prefix, label, url, suffix = '') {
    return new Paragraph({
        spacing: { after: 120 },
        children: [
            new TextRun(prefix),
            link(label, url),
            suffix ? new TextRun(suffix) : null,
        ].filter(Boolean),
    });
}

// -------- Tables ----------------------------------------------------------

function simpleTable(headers, rows, widths) {
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const border = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
    const borders = { top: border, bottom: border, left: border, right: border };

    const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map(
            (label, i) =>
                new TableCell({
                    borders,
                    width: { size: widths[i], type: WidthType.DXA },
                    shading: { type: ShadingType.CLEAR, fill: COLOR_PRIMARY },
                    margins: { top: 80, bottom: 80, left: 120, right: 120 },
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: label,
                                    bold: true,
                                    color: 'FFFFFF',
                                }),
                            ],
                        }),
                    ],
                })
        ),
    });

    const dataRows = rows.map(
        (row) =>
            new TableRow({
                children: row.map(
                    (cell, i) =>
                        new TableCell({
                            borders,
                            width: { size: widths[i], type: WidthType.DXA },
                            margins: { top: 80, bottom: 80, left: 120, right: 120 },
                            children: [new Paragraph({ children: [new TextRun(String(cell))] })],
                        })
                ),
            })
    );

    return new Table({
        width: { size: totalWidth, type: WidthType.DXA },
        columnWidths: widths,
        rows: [headerRow, ...dataRows],
    });
}

function placeholder(label) {
    const border = { style: BorderStyle.DASHED, size: 6, color: COLOR_PRIMARY };
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders: { top: border, bottom: border, left: border, right: border },
                        width: { size: 9360, type: WidthType.DXA },
                        margins: { top: 600, bottom: 600, left: 240, right: 240 },
                        shading: { type: ShadingType.CLEAR, fill: COLOR_LIGHT },
                        verticalAlign: VerticalAlign.CENTER,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({
                                        text: `[ ${label} — capture à insérer ]`,
                                        italics: true,
                                        color: COLOR_PRIMARY,
                                        bold: true,
                                    }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

// -------- Cover page ------------------------------------------------------

const coverParagraphs = [
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 2400, after: 480 },
        children: [
            new TextRun({
                text: 'Centre Européen de Formation',
                bold: true,
                size: 28,
                color: COLOR_PRIMARY,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
            new TextRun({
                text: 'Formation Développeur Web',
                size: 24,
                color: COLOR_DARK,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200 },
        children: [
            new TextRun({
                text: 'Devoir bilan — Module : Publier son application Web',
                italics: true,
                size: 22,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
            new TextRun({
                text: 'Trouve ton artisan',
                bold: true,
                size: 64,
                color: COLOR_DARK,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1800 },
        children: [
            new TextRun({
                text: 'Plateforme web pour la région Auvergne-Rhône-Alpes',
                size: 28,
                color: COLOR_PRIMARY,
            }),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
            new TextRun({ text: 'Auteur : ', bold: true }),
            new TextRun('Sylvain Labeye'),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
            new TextRun({ text: 'Date de rendu : ', bold: true }),
            new TextRun(new Date().toLocaleDateString('fr-FR')),
        ],
    }),
    new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
            new TextRun({ text: 'Identifiant CEF : ', bold: true }),
            new TextRun('F516414B'),
        ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Table of contents ----------------------------------------------

const tocParagraphs = [
    h1('Sommaire'),
    new TableOfContents('Sommaire', {
        hyperlink: true,
        headingStyleRange: '1-3',
    }),
    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 1 : Contexte -------------------------------------------

const contextSection = [
    h1('1. Contexte du projet'),

    h2('1.1 Présentation de l\'entreprise'),
    p(
        "La région Auvergne-Rhône-Alpes couvre 12 départements du quart sud-est de la France. " +
            "Elle dispose de bureaux à Lyon et à Clermont-Ferrand. Près d’un tiers des entreprises " +
            "de la région sont des entreprises artisanales : 221 000 entreprises en 2021, ce qui en fait " +
            'l’une des régions les plus artisanales de France.'
    ),
    p(
        "Pour entretenir cet engouement, la région souhaite créer une plateforme web mettant " +
            "directement en relation les particuliers et les artisans locaux. L’interlocuteur du projet " +
            'se trouve dans les bureaux de Lyon.'
    ),

    h2('1.2 Expression des besoins'),
    p('La plateforme doit permettre :'),
    bullet('À un particulier de trouver un artisan par catégorie ou par nom.'),
    bullet('De consulter la fiche détaillée d’un artisan (note, spécialité, localisation, à propos, site web).'),
    bullet('De contacter directement un artisan via un formulaire de contact (réponse sous 48 h).'),
    bullet('De mettre en avant trois « artisans du mois » sur la page d’accueil.'),

    h2('1.3 Contraintes'),
    bullet('Site accessible à tous (jeunes, personnes âgées, personnes en situation de handicap) : norme WCAG 2.1.'),
    bullet('Conception mobile-first, fonctionnement optimal sur mobile, tablette et ordinateur.'),
    bullet('Sécurité renforcée (collectivité publique).'),
    bullet('Cohérence visuelle avec le site de la région Auvergne-Rhône-Alpes.'),
    bullet('Stack imposée : React.js + Bootstrap + Sass (front), Node.js + Express + Sequelize + MySQL/MariaDB (back).'),
    bullet('Versioning sur GitHub, dépôt public.'),
    bullet('Accès à l’API restreint à l’application.'),

    h2('1.4 Livrables attendus'),
    bullet('Dossier PDF (ce document) : contexte, maquettes, BDD, sécurité, veille, liens.'),
    bullet('Maquettes Figma pour mobile, tablette et ordinateur.'),
    bullet('Lien vers le dépôt GitHub public contenant code + scripts SQL.'),
    bullet('Lien vers le site déployé en ligne.'),
    bullet('Fichier README.md à la racine du dépôt.'),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 2 : Maquettes ------------------------------------------

const mockupSection = [
    h1('2. Maquettes Figma'),
    p(
        "Les maquettes ont été réalisées sous Figma, en mobile-first, pour les trois résolutions " +
            "demandées : mobile (375 px), tablette (768 px) et ordinateur (1280 px). La palette de " +
            "couleurs et la typographie respectent strictement la charte fournie dans le brief."
    ),

    h2('2.1 Charte graphique'),
    simpleTable(
        ['Rôle', 'Couleur', 'Hex', 'Usage principal'],
        [
            ['Fond clair', '#f1f8fc', '#f1f8fc', 'Sections secondaires, hovers'],
            ['Bleu primaire', '#0074c7', '#0074c7', 'Boutons, liens, accents'],
            ['Bleu foncé', '#00497c', '#00497c', 'Hovers et accents forts'],
            ['Gris bleuté', '#384050', '#384050', 'Texte principal, footer'],
            ['Rouge', '#cd2c2e', '#cd2c2e', 'Erreurs, alertes'],
            ['Vert', '#82b864', '#82b864', 'Succès, validations'],
        ],
        [2200, 2200, 2400, 2560]
    ),
    p('Police : Graphik (fallback Helvetica Neue / Arial).', { run: { italics: true } }),
    p(
        'Note importante : Graphik est une police propriétaire (éditeur Commercial Type) ' +
            'fournie sous licence commerciale payante. Pour les maquettes Figma comme pour le ' +
            'rendu actuel du site, c\'est donc Inter (Google Fonts, open-source) qui a été ' +
            'utilisée comme substitut visuel — police géométrique sans-serif très proche de ' +
            'Graphik. Le CSS du site spécifie cependant `font-family: \'Graphik\', \'Helvetica Neue\', ' +
            'Arial, sans-serif`, ce qui permettra à la région de déployer Graphik sans modifier ' +
            'le code dès qu\'elle aura acquis la licence et fourni les fichiers de police.',
        { run: { italics: true } }
    ),

    h2('2.2 Lien Figma'),
    pWithLink(
        'Maquettes complètes (consultation publique) : ',
        'Ouvrir le fichier Figma',
        'https://www.figma.com/design/vch2TgFsEjaY9O7gjnNakX/Trouve-ton-Artisan'
    ),

    h2('2.3 Captures d’écran'),

    h3('2.3.1 Charte graphique'),
    placeholder('Charte graphique — logo, favicon, palette, typographie'),

    h3('2.3.2 Accueil'),
    placeholder('Accueil — mobile 375 px'),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun('')] }),
    placeholder('Accueil — tablette 768 px'),
    new Paragraph({ spacing: { after: 120 }, children: [new TextRun('')] }),
    placeholder('Accueil — ordinateur 1280 px'),

    h3('2.3.3 Liste des artisans'),
    placeholder('Liste — mobile / tablette / desktop'),

    h3('2.3.4 Fiche artisan + formulaire'),
    placeholder('Fiche artisan — mobile / tablette / desktop'),

    h3('2.3.5 Page 404'),
    placeholder('Page 404 — mobile / desktop'),

    h2('2.4 Enchaînement des écrans'),
    code(`[Accueil] ─ menu catégorie ────► [Liste filtrée]
          ─ recherche ─────────► [Liste filtrée]
          ─ artisan du mois ────► [Fiche artisan]
                                          │
                                          ▼
                                  [Formulaire] ──► confirmation

[Liste] ─ clic carte ────► [Fiche artisan]
[Toute URL inconnue] ────► [404] ─ retour ─► [Accueil]`),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 3 : BDD ------------------------------------------------

const dbSection = [
    h1('3. Base de données'),

    h2('3.1 Règles de gestion'),
    bullet('Un artisan apparaît dans une seule spécialité.'),
    bullet('Une spécialité est rattachée à une seule catégorie.'),
    bullet('Un artisan peut être marqué « artisan du mois ».'),
    bullet('Chaque artisan possède une note décimale entre 0 et 5.'),
    bullet('Un message de contact est associé à un seul artisan ; un artisan peut en recevoir plusieurs.'),

    h2('3.2 Modèle conceptuel de données (MCD)'),
    code(`+-----------+ 1,n         1,1 +-------------+ 1,n      1,1 +-----------+
| CATEGORIE |-----< rattachée >-----| SPECIALITE  |----< pratiquée >----|  ARTISAN  |
+-----------+                       +-------------+                       +-----------+
| id        |                       | id          |                       | id        |
| nom       |                       | nom         |                       | nom       |
+-----------+                       +-------------+                       | note      |
                                                                          | ville     |
                                                                          | email     |
                                                                          | a_propos  |
                                                                          | site_web  |
                                                                          | top_mois  |
                                                                          +-----------+
                                                                                  | 1,n
                                                                                  |
                                                                          < destinataire >
                                                                                  |
                                                                                  | 1,1
                                                                          +-----------------+
                                                                          | MESSAGE_CONTACT |
                                                                          +-----------------+
                                                                          | id              |
                                                                          | expediteur_nom  |
                                                                          | expediteur_email|
                                                                          | objet           |
                                                                          | message         |
                                                                          | date_envoi      |
                                                                          +-----------------+`),

    h2('3.3 Modèle logique de données (MLD)'),
    code(`categories       (id, nom)
specialties      (id, nom, #category_id)
artisans         (id, nom, note, ville, a_propos, email, site_web, image_url,
                  top_du_mois, #specialty_id)
contact_messages (id, expediteur_nom, expediteur_email, objet, message,
                  date_envoi, #artisan_id)`),

    h2('3.4 Modèle physique de données (extrait)'),
    code(`CREATE TABLE artisans (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  rating          DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  city            VARCHAR(120) NOT NULL,
  about           TEXT,
  email           VARCHAR(180) NOT NULL,
  website         VARCHAR(255),
  image_url       VARCHAR(255),
  specialty_id    INT UNSIGNED NOT NULL,
  is_top_of_month BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_rating CHECK (rating BETWEEN 0 AND 5),
  CONSTRAINT fk_artisan_specialty
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`),
    p(
        'Les scripts complets sont disponibles dans le dépôt GitHub : ' +
            'database/01_schema.sql (création) et database/02_seed.sql (jeu d’essai).'
    ),

    h2('3.5 Jeu d’essai'),
    p('Le jeu d’essai reprend intégralement le contenu du fichier data.xlsx fourni :'),
    bullet('4 catégories : Bâtiment, Services, Fabrication, Alimentation.'),
    bullet('15 spécialités réparties dans les 4 catégories.'),
    bullet('17 artisans dont 3 mis en avant comme « artisans du mois ».'),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 4 : Sécurité -------------------------------------------

const SECURITY_TABLE = [
    [
        'Clé d’API partagée',
        'Middleware Express vérifiant l’en-tête x-api-key (comparaison à temps constant via crypto.timingSafeEqual).',
        "Restreint l’accès de l’API à la seule application web (exigence du brief).",
    ],
    [
        'CORS allowlist',
        'Politique CORS limitée aux origines listées dans CORS_ORIGIN ; méthodes restreintes à GET et POST.',
        "Empêche tout site tiers d’appeler l’API depuis un navigateur.",
    ],
    [
        'Helmet',
        'En-têtes HTTP : nosniff, no-referrer, HSTS, X-Frame-Options…',
        'Bouche les défauts de configuration HTTP courants (sniffing MIME, downgrade TLS, fuite de referer).',
    ],
    [
        'Rate limiting',
        'express-rate-limit : 100 req/15 min global, 5 req/15 min sur le formulaire de contact.',
        'Empêche le spam et la force brute sur la clé d’API.',
    ],
    [
        'Validation des entrées',
        'express-validator côté serveur + validation HTML5/JS côté client.',
        'Évite les données malformées, prépare le terrain contre XSS et injection.',
    ],
    [
        'Anti-injection SQL',
        'Accès BDD via Sequelize (requêtes paramétrées). Aucun assemblage manuel.',
        "Empêche l’injection SQL (OWASP A03).",
    ],
    [
        'Privilèges BDD minimaux',
        "Compte applicatif (ttartisan_app) limité à SELECT/INSERT/UPDATE/DELETE.",
        "Limite l’impact d’une compromission de la couche applicative.",
    ],
    [
        'Secrets en variables d’env.',
        'dotenv + .env hors du dépôt (.gitignore).',
        'Pas de secret dans le code, rotation facile.',
    ],
    [
        'HTTPS obligatoire',
        'TLS terminé par l’hébergeur ; HSTS via Helmet.',
        "Confidentialité et intégrité des échanges (notamment du formulaire).",
    ],
    [
        'Taille des requêtes',
        "express.json({ limit: '32kb' }).",
        "Protection basique contre les payloads abusifs.",
    ],
    [
        'Gestion d’erreurs centralisée',
        'Middleware errorHandler qui masque les détails techniques en production.',
        'Pas de fuite de stack trace ou de schéma BDD.',
    ],
    [
        'Traçabilité',
        'Table contact_messages : enregistrement systématique des messages envoyés.',
        'Auditabilité en cas d’incident (spam, réclamation).',
    ],
];

const securitySection = [
    h1('4. Sécurité'),
    p(
        'La sécurité est une exigence majeure de la région (collectivité publique). ' +
            "Plusieurs couches ont été mises en place, depuis l’accès réseau jusqu’à la base de " +
            'données, en suivant les recommandations de l’OWASP Top 10 (2021).'
    ),

    h2('4.1 Synthèse des mesures'),
    simpleTable(
        ['Mesure', 'Mise en œuvre', 'Intérêt'],
        SECURITY_TABLE,
        [2400, 3600, 3360]
    ),

    h2('4.2 Détail des principales mesures'),

    h3('4.2.1 Authentification de l’application par clé d’API'),
    p(
        "Le brief impose que l’API soit accessible uniquement à l’application. Un middleware Express " +
            "vérifie l’en-tête x-api-key envoyé par le client. La comparaison est effectuée à temps " +
            'constant (Node crypto.timingSafeEqual) pour éviter les attaques par mesure de temps de réponse. ' +
            'La clé est stockée côté serveur et côté client uniquement dans des variables d’environnement.'
    ),

    h3('4.2.2 Politique CORS restrictive'),
    p(
        "Les requêtes XHR/Fetch sont autorisées uniquement depuis les origines listées dans la variable " +
            "CORS_ORIGIN (le domaine du frontend en production et localhost en développement). Toute autre " +
            'origine reçoit une erreur CORS du navigateur.'
    ),

    h3('4.2.3 Protection des données utilisateur'),
    p(
        'Le formulaire de contact collecte le strict minimum (nom, e-mail, objet, message). La table ' +
            'contact_messages enregistre ces données pour traçabilité. Une politique de purge automatique ' +
            '(par exemple 12 mois glissants) pourra être ajoutée. La page « Données personnelles » sera ' +
            'complétée par un cabinet spécialisé conformément au RGPD.'
    ),

    h3('4.2.4 Limitation du débit et anti-spam'),
    p(
        'Au-delà du middleware global, la route POST /api/artisans/:id/contact applique une limite plus ' +
            "stricte (5 envois / 15 min / IP). Couplé au caractère obligatoire de la clé d’API, cela " +
            'rend extrêmement coûteuses les tentatives de spam massif des artisans.'
    ),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 5 : Veille ---------------------------------------------

const watchSection = [
    h1('5. Veille de sécurité'),

    h2('5.1 Sources consultées'),
    bullet('OWASP Top 10 (2021) — vulnérabilités web et recommandations.'),
    bullet('OWASP Cheat Sheets — fiches pratiques.'),
    bullet('Snyk Vulnerability DB & GitHub Security Advisories — CVE des paquets npm utilisés.'),
    bullet('CNIL — bonnes pratiques RGPD pour les formulaires.'),
    bullet('W3C — WCAG 2.1 (accessibilité, imposé par le brief).'),
    bullet('MDN Web Docs — détails sur les en-têtes HTTP de sécurité (CSP, HSTS, etc.).'),

    h2('5.2 Vulnérabilités OWASP étudiées'),
    simpleTable(
        ['Vulnérabilité', 'Mesure prise'],
        [
            ['A01 Broken Access Control', 'Clé d’API obligatoire, pas de session, pas d’admin exposé.'],
            ['A02 Cryptographic Failures', 'HTTPS + HSTS, secrets en variables d’environnement, comparaison à temps constant.'],
            ['A03 Injection', 'Sequelize (paramétré), express-validator, échappement React.'],
            ['A04 Insecure Design', 'Modèle simple, contraintes BDD, moindre privilège.'],
            ['A05 Security Misconfiguration', 'Helmet, x-powered-by désactivé, errorHandler discret en production.'],
            ['A06 Vulnerable Components', 'npm audit, dépendances à jour, lockfile commité.'],
            ['A07 Auth Failures', 'Pas d’espace membre, rate limiting, clé longue et aléatoire.'],
            ['A08 Software Integrity', 'package-lock.json versionné, sources officielles npm.'],
            ['A09 Logging Failures', 'Morgan en logs HTTP, traçabilité des messages.'],
            ['A10 SSRF', 'Aucune requête sortante déclenchée par des données utilisateur.'],
        ],
        [3360, 6000]
    ),

    h2('5.3 Tests effectués sur le projet'),
    simpleTable(
        ['Test', 'Résultat attendu', 'Résultat obtenu'],
        [
            ["Injection SQL via ?q='OR 1=1--", 'Aucune ligne supplémentaire renvoyée', 'OK — Sequelize paramétré'],
            ['XSS via formulaire de contact', 'Texte stocké tel quel, non exécuté', 'OK — React échappe automatiquement'],
            ['Appel sans clé d’API', '401 Unauthorized', 'OK — middleware apiKey'],
            ['Origine non autorisée', 'Erreur CORS', 'OK'],
            ['Spam du formulaire (>5/15 min)', '429 Too Many Requests', 'OK — express-rate-limit'],
            ['Payload JSON > 32 ko', 'Refus 413', 'OK — express.json limit'],
            ['npm audit (front + back)', 'Aucune vuln. critique', 'OK au moment du rendu'],
        ],
        [3000, 3000, 3360]
    ),

    h2('5.4 Vulnérabilités corrigées en cours de développement'),
    bullet('Comparaison naïve de la clé d’API remplacée par crypto.timingSafeEqual (anti-timing attack).'),
    bullet('Ajout d’un handler explicite pour les 404 API afin d’éviter toute fuite de stack Express.'),
    bullet('Désactivation de l’en-tête X-Powered-By d’Express.'),
    bullet('Aucun usage de dangerouslySetInnerHTML côté React (XSS stocké/réfléchi).'),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 6 : Liens ----------------------------------------------

const linksSection = [
    h1('6. Liens du projet'),

    h2('6.1 Dépôt GitHub'),
    pWithLink(
        'Le dépôt est public et contient l’intégralité du code, les scripts SQL et le README.md : ',
        'https://github.com/Sylvain13bdr/trouve-ton-artisan',
        'https://github.com/Sylvain13bdr/trouve-ton-artisan'
    ),
    p('Contenu du dépôt :'),
    bullet('backend/ — API Express + Sequelize.'),
    bullet('frontend/ — Application React + Bootstrap + Sass.'),
    bullet('database/01_schema.sql — Création de la base de données (version XAMPP locale).'),
    bullet('database/02_seed.sql — Alimentation (17 artisans).'),
    bullet('database/remote/ — Variantes des scripts SQL pour hébergement distant (AlwaysData).'),
    bullet('docs/ — Documentation technique (sécurité, veille, BDD, maquettes).'),
    bullet('README.md — Prérequis, installation, lancement.'),

    h2('6.2 Site déployé'),
    pWithLink(
        'Frontend (Vercel) : ',
        'https://trouve-ton-artisan-rosy.vercel.app/',
        'https://trouve-ton-artisan-rosy.vercel.app/'
    ),
    pWithLink(
        'API (Render) : ',
        'https://trouve-ton-artisan-api-oqmj.onrender.com/api/health',
        'https://trouve-ton-artisan-api-oqmj.onrender.com/api/health'
    ),
    p('Base de données MySQL/MariaDB hébergée sur AlwaysData (hôte mysql-sylvain13bdr.alwaysdata.net), connexion SSL obligatoire.'),

    h2('6.3 Maquettes Figma'),
    pWithLink(
        'Fichier de maquettes (lecture publique) : ',
        'https://www.figma.com/design/vch2TgFsEjaY9O7gjnNakX/Trouve-ton-Artisan',
        'https://www.figma.com/design/vch2TgFsEjaY9O7gjnNakX/Trouve-ton-Artisan'
    ),
];

// -------- Document --------------------------------------------------------

const doc = new Document({
    creator: 'Sylvain Labeye',
    title: 'Trouve ton artisan — Dossier de rendu',
    description: 'Devoir bilan CEF — Trouve ton artisan',
    styles: {
        default: { document: { run: { font: 'Arial', size: 22 } } },
        paragraphStyles: [
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 36, bold: true, color: COLOR_PRIMARY, font: 'Arial' },
                paragraph: { spacing: { before: 360, after: 180 }, outlineLevel: 0 },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 28, bold: true, color: COLOR_DARK, font: 'Arial' },
                paragraph: { spacing: { before: 280, after: 140 }, outlineLevel: 1 },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                quickFormat: true,
                run: { size: 24, bold: true, color: COLOR_DARK, font: 'Arial' },
                paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 2 },
            },
        ],
    },
    numbering: {
        config: [
            {
                reference: 'bullets',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.BULLET,
                        text: '•',
                        alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                    },
                    {
                        level: 1,
                        format: LevelFormat.BULLET,
                        text: '◦',
                        alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 1440, hanging: 360 } } },
                    },
                ],
            },
            {
                reference: 'numbers',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: '%1.',
                        alignment: AlignmentType.LEFT,
                        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
                    },
                ],
            },
        ],
    },
    sections: [
        {
            properties: {
                page: {
                    size: { width: 11906, height: 16838 }, // A4
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            tabStops: [
                                { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                            ],
                            border: {
                                bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 6,
                                    color: COLOR_PRIMARY,
                                    space: 4,
                                },
                            },
                            children: [
                                new TextRun({
                                    text: 'Trouve ton artisan — Dossier de rendu',
                                    color: COLOR_DARK,
                                    bold: true,
                                }),
                                new TextRun({
                                    text: '\tCEF — Devoir bilan',
                                    color: COLOR_PRIMARY,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            tabStops: [
                                { type: TabStopType.RIGHT, position: TabStopPosition.MAX },
                            ],
                            border: {
                                top: {
                                    style: BorderStyle.SINGLE,
                                    size: 4,
                                    color: COLOR_BORDER,
                                    space: 4,
                                },
                            },
                            children: [
                                new TextRun({
                                    text: 'Sylvain Labeye — ',
                                    color: COLOR_DARK,
                                }),
                                new TextRun({
                                    text: new Date().toLocaleDateString('fr-FR'),
                                    color: COLOR_DARK,
                                }),
                                new TextRun({ text: '\tPage ', color: COLOR_DARK }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    color: COLOR_DARK,
                                }),
                                new TextRun({ text: ' / ', color: COLOR_DARK }),
                                new TextRun({
                                    children: [PageNumber.TOTAL_PAGES],
                                    color: COLOR_DARK,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                ...coverParagraphs,
                ...tocParagraphs,
                ...contextSection,
                ...mockupSection,
                ...dbSection,
                ...securitySection,
                ...watchSection,
                ...linksSection,
            ],
        },
    ],
});

const outputPath = path.join(__dirname, 'dossier-trouve-ton-artisan.docx');

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync(outputPath, buffer);
    // eslint-disable-next-line no-console
    console.log(`Dossier généré : ${outputPath}`);
});
