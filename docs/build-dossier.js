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
    ImageRun,
} = require('docx');

// Dimensions réelles des screenshots Figma (en pixels)
const FIGMA_DIMS = {
    'charte-graphique.png':  { w: 1280, h: 900 },
    'accueil-desktop.png':   { w: 1280, h: 1400 },
    'accueil-tablette.png':  { w: 768,  h: 1730 },
    'accueil-mobile.png':    { w: 375,  h: 1960 },
    'liste-desktop.png':     { w: 1280, h: 1086 },
    'liste-tablette.png':    { w: 768,  h: 1054 },
    'liste-mobile.png':      { w: 375,  h: 1677 },
    'fiche-desktop.png':     { w: 1280, h: 1042 },
    'fiche-tablette.png':    { w: 768,  h: 1276 },
    'fiche-mobile.png':      { w: 375,  h: 1256 },
    '404-desktop.png':       { w: 1280, h: 672 },
    '404-mobile.png':        { w: 375,  h: 542 },
    'enchainement.svg':      { w: 640,  h: 900 },
};

/**
 * Insère une capture PNG redimensionnée pour tenir dans la page A4.
 * @param {string} filename — nom du fichier PNG dans `captures/`
 * @param {object} [opts]
 * @param {number} [opts.maxW=500] — largeur max en pixels
 * @param {number} [opts.maxH=600] — hauteur max en pixels
 * @param {string} [opts.caption] — texte sous l'image
 */
function image(filename, opts = {}) {
    const filePath = path.join(__dirname, 'captures', filename);
    const dims = FIGMA_DIMS[filename] || { w: 1280, h: 800 };
    const maxW = opts.maxW || 500;
    const maxH = opts.maxH || 600;
    const ratioW = maxW / dims.w;
    const ratioH = maxH / dims.h;
    const ratio = Math.min(ratioW, ratioH, 1);
    const width = Math.round(dims.w * ratio);
    const height = Math.round(dims.h * ratio);

    const paragraphs = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 60 },
            children: [
                new ImageRun({
                    type: 'png',
                    data: fs.readFileSync(filePath),
                    transformation: { width, height },
                    altText: {
                        title: opts.caption || filename,
                        description: opts.caption || filename,
                        name: filename,
                    },
                }),
            ],
        }),
    ];

    if (opts.caption) {
        paragraphs.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 180 },
                children: [
                    new TextRun({
                        text: opts.caption,
                        italics: true,
                        size: 18,
                        color: COLOR_DARK,
                    }),
                ],
            })
        );
    }
    return paragraphs;
}

// PNG 1x1 transparent : fallback exigé par Word pour les images SVG
// (Word et LibreOffice affichent le SVG vectoriel ; le fallback ne sert
// qu'aux visionneuses anciennes).
const SVG_FALLBACK_PNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64'
);

/**
 * Insère une image SVG (vectorielle) redimensionnée pour tenir dans la page A4.
 */
function svgImage(filename, opts = {}) {
    const filePath = path.join(__dirname, 'captures', filename);
    const dims = FIGMA_DIMS[filename] || { w: 640, h: 900 };
    const maxW = opts.maxW || 400;
    const maxH = opts.maxH || 600;
    const ratio = Math.min(maxW / dims.w, maxH / dims.h, 1);
    const width = Math.round(dims.w * ratio);
    const height = Math.round(dims.h * ratio);

    return [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: opts.caption ? 60 : 180 },
            children: [
                new ImageRun({
                    type: 'svg',
                    data: fs.readFileSync(filePath),
                    transformation: { width, height },
                    fallback: { type: 'png', data: SVG_FALLBACK_PNG },
                    altText: {
                        title: opts.caption || filename,
                        description: opts.caption || filename,
                        name: filename,
                    },
                }),
            ],
        }),
        ...(opts.caption
            ? [
                  new Paragraph({
                      alignment: AlignmentType.CENTER,
                      spacing: { after: 180 },
                      children: [
                          new TextRun({ text: opts.caption, italics: true, size: 18, color: COLOR_DARK }),
                      ],
                  }),
              ]
            : []),
    ];
}

// Bloc 3 résolutions empilées pour une page donnée
function threeRes(baseSlug, label) {
    return [
        ...image(`${baseSlug}-mobile.png`,   { maxW: 200, caption: `${label} — Mobile (375 px)` }),
        ...image(`${baseSlug}-tablette.png`, { maxW: 360, caption: `${label} — Tablette (768 px)` }),
        ...image(`${baseSlug}-desktop.png`,  { maxW: 540, caption: `${label} — Desktop (1280 px)` }),
    ];
}

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
    const lines = String(text).split('\n');
    return new Paragraph({
        spacing: { after: 120 },
        shading: { type: ShadingType.CLEAR, fill: COLOR_LIGHT },
        children: lines.map((line, i) =>
            new TextRun({
                text: line,
                font: 'Consolas',
                size: 20,
                ...(i > 0 ? { break: 1 } : {}),
            })
        ),
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
                text: 'Titre professionnel Développeur Web et Web Mobile (DWWM)',
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
                text: 'Dossier de projet — Préparation à l\'examen du titre professionnel',
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

// -------- Introduction : Compétences du référentiel ---------------------

const competencesSection = [
    h1('Introduction — Compétences du référentiel couvertes'),
    p(
        'Ce dossier présente « Trouve ton artisan », une application web full-stack réalisée dans le ' +
            'cadre de la préparation au titre professionnel Développeur Web et Web Mobile (DWWM). Le projet ' +
            'met en œuvre les compétences obligatoires des deux activités-types du référentiel, côté ' +
            'front-end comme back-end, avec un soin particulier porté à la sécurité, à l\'accessibilité et ' +
            'à la couverture des données à la fois relationnelles (MySQL/MariaDB) et NoSQL (MongoDB).'
    ),
    h2('Activité-type 1 — Développer la partie front-end d\'une application web ou web mobile sécurisée'),
    simpleTable(
        ['Compétence', 'Mise en œuvre dans le projet'],
        [
            ['Maquetter des interfaces utilisateur web ou web mobile', 'Maquettes Figma en mobile-first pour les trois résolutions (mobile 375 px, tablette 768 px, ordinateur 1280 px), charte graphique respectée, schéma d\'enchaînement des écrans.'],
            ['Réaliser des interfaces utilisateur statiques web ou web mobile', 'Composants React structurés, Bootstrap 5 et Sass, HTML sémantique, mise en page responsive, accessibilité WCAG 2.1 (lien d\'évitement, attributs ARIA, focus visible).'],
            ['Développer la partie dynamique des interfaces utilisateur web ou web mobile', 'React (hooks d\'état et d\'effet), consommation de l\'API REST via un client fetch centralisé, formulaires dynamiques (contact et avis) avec validation côté client.'],
        ],
        [3200, 6160]
    ),
    h2('Activité-type 2 — Développer la partie back-end d\'une application web ou web mobile sécurisée'),
    simpleTable(
        ['Compétence', 'Mise en œuvre dans le projet'],
        [
            ['Mettre en place une base de données relationnelle', 'MySQL/MariaDB : MCD, MLD et modèle physique, respect des trois formes normales, contraintes (clés étrangères, CHECK, UNIQUE), vue de lecture, scripts de création et d\'alimentation.'],
            ['Développer des composants d\'accès aux données SQL et NoSQL', 'Couche services dédiée : accès SQL via Sequelize (artisans, catégories, villes) ET accès NoSQL via Mongoose (avis clients stockés dans MongoDB).'],
            ['Développer des composants métier côté serveur', 'Architecture en couches (routes → contrôleurs → services → modèles), logique métier isolée dans les services, validation, sécurité et gestion centralisée des erreurs.'],
        ],
        [3200, 6160]
    ),
    p(
        'Les deux compétences non obligatoires dans le dossier — installer et configurer son environnement ' +
            'de travail, et documenter le déploiement — sont également mises en œuvre (environnement ' +
            'Node.js / VS Code / Git, déploiement Vercel + Render + base de données hébergée) et pourront ' +
            'être détaillées lors de l\'entretien technique.',
        { run: { italics: true } }
    ),
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
        "Pour valoriser ce tissu artisanal, la région souhaite créer une plateforme web mettant " +
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
    bullet('Stack : React + Bootstrap + Sass (front) ; Node.js + Express + Sequelize avec MySQL/MariaDB, et MongoDB/Mongoose pour les avis (back).'),
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
    h1('2. Réalisations front-end'),
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
        'Graphik étant une police sous licence, Inter a servi de substitut pour les maquettes Figma. Côté ' +
            'site, la police Graphik (version d\'essai) est désormais auto-hébergée au format woff2 et ' +
            'chargée via @font-face : le rendu reprend ainsi fidèlement la charte, avec repli sur des polices ' +
            'système en cas de besoin.'
    ),

    h2('2.2 Lien Figma'),
    pWithLink(
        'Maquettes complètes (consultation publique) : ',
        'Ouvrir le fichier Figma',
        'https://www.figma.com/design/vch2TgFsEjaY9O7gjnNakX/Trouve-ton-Artisan'
    ),

    h2('2.3 Captures d’écran'),

    h3('2.3.1 Charte graphique'),
    ...image('charte-graphique.png', { maxW: 540, caption: 'Charte graphique — logo, favicon, palette, typographie' }),

    h3('2.3.2 Accueil'),
    ...threeRes('accueil', 'Accueil'),

    h3('2.3.3 Liste des artisans'),
    ...threeRes('liste', 'Liste — catégorie Bâtiment'),

    h3('2.3.4 Fiche artisan + formulaire'),
    p(
        'La fiche d\'Orville Salmons sert d\'exemple. La même structure est utilisée pour les 17 artisans, seules les données changent.'
    ),
    ...threeRes('fiche', 'Fiche artisan'),

    h3('2.3.5 Page 404'),
    ...image('404-mobile.png',  { maxW: 200, caption: '404 — Mobile (375 px)' }),
    ...image('404-desktop.png', { maxW: 540, caption: '404 — Desktop (1280 px)' }),

    h2('2.4 Enchaînement des écrans'),
    p(
        'Le schéma ci-dessous résume la navigation entre les écrans du site : depuis la page ' +
            'd\'accueil vers la liste (par catégorie ou recherche) ou une fiche (artisan du mois), ' +
            'puis le formulaire de contact et sa confirmation. Toute URL inconnue mène à la page ' +
            '404, qui ramène à l\'accueil.'
    ),
    ...svgImage('enchainement.svg', { maxW: 410, maxH: 620 }),

    h2('2.5 Interfaces utilisateur statiques'),
    p(
        'Les interfaces sont construites en composants React et mises en forme avec Bootstrap 5 et Sass. ' +
            'Le balisage reste sémantique et accessible. La section d\'accueil illustre une structure ' +
            'statique simple : un en-tête de section, un titre principal et un bouton d\'appel à l\'action.'
    ),
    code(`<section className="hero">
  <div className="container">
    <h1>Trouvez l'artisan qu'il vous faut, pres de chez vous.</h1>
    <p className="lead">Batiment, alimentation, services, fabrication.</p>
    <Link to="/artisans" className="btn btn-primary btn-lg">
      Voir tous les artisans
    </Link>
  </div>
</section>`),

    h2('2.6 Partie dynamique des interfaces'),
    p(
        'La partie dynamique repose sur les hooks de React. Le chargement des artisans, par exemple, se ' +
            'déclenche à l\'affichage de la page et à chaque changement de filtre ; l\'état local gère ' +
            'l\'attente, les données reçues et les erreurs éventuelles.'
    ),
    code(`useEffect(() => {
  setLoading(true);
  api.getArtisans({ category, q })
    .then((data) => setArtisans(data))
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, [category, q]);`),

    h2('2.7 Accessibilité et référencement'),
    p(
        'Le site vise la conformité WCAG 2.1 et, dans sa déclinaison française, le RGAA (Référentiel ' +
            'Général d\'Amélioration de l\'Accessibilité), opposable aux organismes publics — ce qui est ' +
            'directement pertinent ici, le commanditaire étant une collectivité. Concrètement : balises ' +
            'sémantiques, lien d\'évitement vers le contenu principal, libellés associés à chaque champ de ' +
            'formulaire, images décoratives neutralisées pour les lecteurs d\'écran (alt vide ou ' +
            'aria-hidden), ordre de tabulation logique, focus visible et navigation entièrement au clavier. ' +
            'Le composant de notation expose aussi bien les étoiles que la valeur chiffrée. Les contrastes de ' +
            'la palette ont été vérifiés par rapport au seuil AA.'
    ),
    p(
        'Côté référencement, chaque page définit son propre titre et sa méta-description grâce aux ' +
            'métadonnées natives de React 19 (composant Seo), ce qui améliore l\'indexation par les moteurs ' +
            'de recherche et l\'aperçu lors d\'un partage sur les réseaux sociaux. Les URL restent propres et ' +
            'lisibles grâce à React Router.'
    ),

    h2('2.8 Éco-conception'),
    p(
        'Quelques principes d\'éco-conception ont été pris en compte. Les images des artisans sont chargées ' +
            'en différé (lazy loading), ce qui évite de télécharger des visuels non affichés à l\'écran. La ' +
            'typographie est auto-hébergée au format woff2 (compressé), ce qui évite toute requête vers un ' +
            'service tiers de polices. Côté serveur, l\'API ne renvoie que les colonnes utiles (pas de SELECT *) et ' +
            's\'appuie sur une vue SQL qui pré-assemble les jointures, ce qui réduit le volume de données ' +
            'transférées. Le build de production (Vite) minifie et compresse enfin les fichiers envoyés au ' +
            'navigateur.'
    ),

    new Paragraph({ children: [new PageBreak()] }),
];

// -------- Section 3 : BDD ------------------------------------------------

const dbSection = [
    h1('3. Base de données et composants serveur'),

    h2('3.1 Règles de gestion'),
    bullet('Un artisan appartient à une seule spécialité.'),
    bullet('Une spécialité est rattachée à une seule catégorie.'),
    bullet('Un artisan est localisé dans une seule ville ; une ville regroupe potentiellement plusieurs artisans.'),
    bullet('Un artisan peut être marqué « artisan du mois ».'),
    bullet('Chaque artisan possède une note décimale entre 0 et 5.'),
    bullet('Un message de contact est associé à un seul artisan ; un artisan peut en recevoir plusieurs.'),

    h2('3.2 Respect des formes normales'),
    p(
        'Le schéma respecte les trois premières formes normales (1FN, 2FN, 3FN). En particulier, ' +
            'la ville a été externalisée dans une table dédiée (cities) pour éviter la redondance du ' +
            'nom de ville sur chaque ligne d\'artisan (3FN) : si une ville change de nom, une seule ' +
            'ligne est à modifier. Idem pour les catégories et les spécialités, qui sont des tables ' +
            'référentielles distinctes.'
    ),

    h2('3.3 Modèle conceptuel de données (MCD)'),
    ...image('mcd.png', { maxW: 480, maxH: 720, caption: 'MCD — 5 entités, cardinalités explicites' }),

    h2('3.4 Modèle logique de données (MLD)'),
    ...image('mld.png', { maxW: 540, maxH: 720, caption: 'MLD — types SQL, PK / UK / FK identifiés' }),
    p('Notation textuelle équivalente (avec PK soulignée et FK préfixées par #) :'),
    code(`categories       (id, name)
specialties      (id, name, #category_id)
cities           (id, name)
artisans         (id, name, rating, about, email, website, image_url,
                  is_top_of_month, #specialty_id, #city_id)
contact_messages (id, sender_name, sender_email, subject, message,
                  created_at, #artisan_id)`),

    h2('3.5 Modèle physique de données (extrait)'),
    code(`CREATE TABLE cities (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE artisans (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(120) NOT NULL,
  rating          DECIMAL(2,1) NOT NULL DEFAULT 0.0,
  city_id         INT UNSIGNED NOT NULL,
  about           TEXT,
  email           VARCHAR(180) NOT NULL,
  website         VARCHAR(255),
  image_url       VARCHAR(255),
  specialty_id    INT UNSIGNED NOT NULL,
  is_top_of_month BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                          ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_artisan_rating CHECK (rating >= 0.0 AND rating <= 5.0),
  CONSTRAINT chk_artisan_email  CHECK (email LIKE '%_@_%.__%'),
  CONSTRAINT fk_artisan_specialty
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_artisan_city
    FOREIGN KEY (city_id) REFERENCES cities(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`),
    p(
        'Les scripts SQL complets se trouvent dans database/01_schema.sql (création) et ' +
            'database/02_seed.sql (jeu d\'essai). Une variante adaptée à un hébergement préfixé ' +
            '(AlwaysData) est disponible dans database/remote/.'
    ),

    h2('3.6 Jeu d\'essai (données initiales)'),
    p('Issu du fichier data.xlsx fourni avec le brief :'),
    bullet('4 catégories : Bâtiment, Services, Fabrication, Alimentation.'),
    bullet('15 spécialités réparties dans les 4 catégories.'),
    bullet('14 villes uniques (Lyon revient 3 fois, Valence 2 fois, les autres 1 fois).'),
    bullet('17 artisans dont 3 mis en avant comme « artisans du mois ».'),

    h2('3.7 Données NoSQL : les avis clients (MongoDB)'),
    p(
        'En complément de la base relationnelle, les avis déposés par les visiteurs sur la fiche d\'un ' +
            'artisan sont stockés dans une base MongoDB, via l\'ODM Mongoose. Ce choix répond à l\'exigence ' +
            'du référentiel — manipuler des données à la fois SQL et NoSQL. Il se justifie aussi par la ' +
            'nature des avis. Leur schéma est souple et peut évoluer, par exemple pour accueillir une ' +
            'réponse de l\'artisan imbriquée dans l\'avis. Ils se lisent artisan par artisan, sans jointure, ' +
            'et leur volume est amené à grandir. Les deux bases cohabitent : l\'artisan reste en relationnel, ' +
            'ses avis en documentaire, le lien étant assuré par l\'identifiant de l\'artisan.'
    ),
    code(`const reviewSchema = new mongoose.Schema({
  artisanId:  { type: Number, required: true, index: true },
  authorName: { type: String, required: true, minlength: 2, maxlength: 120 },
  rating:     { type: Number, required: true, min: 1, max: 5 },
  comment:    { type: String, required: true, minlength: 10, maxlength: 2000 },
  reply: { message: String, repliedAt: Date }, // reponse eventuelle de l'artisan
}, { timestamps: true });`),
    p(
        'La connexion à MongoDB est volontairement non bloquante : si la base NoSQL est momentanément ' +
            'indisponible, l\'API relationnelle continue de fonctionner et les routes d\'avis renvoient un ' +
            'code 503 explicite.'
    ),
    p(
        'Côté schéma physique, la collection « reviews » est décrite par le modèle Mongoose ' +
            '(backend/src/models/Review.js), qui fait aussi office de validation : les types, les champs ' +
            'obligatoires et les bornes (note de 1 à 5, longueurs minimales et maximales) sont contrôlés à ' +
            'l\'écriture. Un index sur le champ artisanId, déclaré dans le modèle, accélère la lecture des ' +
            'avis d\'un artisan ; Mongoose le crée automatiquement au démarrage.'
    ),

    h2('3.8 Composants d\'accès aux données (SQL et NoSQL)'),
    p(
        'L\'accès aux données est isolé dans une couche de services, séparée des contrôleurs. Côté ' +
            'relationnel, les services s\'appuient sur Sequelize, qui génère des requêtes paramétrées. Côté ' +
            'documentaire, un service dédié interroge MongoDB. Les deux exposent le même type d\'interface ' +
            'aux contrôleurs, ce qui garde le code homogène malgré les deux technologies de stockage.'
    ),
    code(`// Acces SQL (Sequelize) - liste filtree des artisans
const results = await Artisan.findAll({
  where,
  include: fullInclude,
  order: [['rating', 'DESC'], ['name', 'ASC']],
});`),
    code(`// Acces NoSQL (Mongoose) - avis d'un artisan + moyenne par agregation
const items = await Review.find({ artisanId }).sort({ createdAt: -1 }).lean();
const [stats] = await Review.aggregate([
  { $match: { artisanId } },
  { $group: { _id: '$artisanId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
]);`),

    h2('3.9 Composants métier côté serveur'),
    p(
        'La logique métier est portée par les services, jamais par les contrôleurs, qui se contentent de ' +
            'lire la requête et de mettre en forme la réponse. La création d\'un avis illustre la ' +
            'collaboration des deux bases : le service vérifie d\'abord, côté relationnel, que l\'artisan ' +
            'existe, avant d\'enregistrer l\'avis côté MongoDB.'
    ),
    code(`async function createReview(artisanId, { authorName, rating, comment }) {
  const artisan = await Artisan.findByPk(artisanId);   // verification cote SQL
  if (!artisan) return { notFound: true };
  const review = await Review.create({ artisanId, authorName, rating, comment }); // ecriture NoSQL
  return { review };
}`),

    h2('3.10 Jeu d\'essai de la fonctionnalité la plus représentative'),
    p(
        'La fonctionnalité retenue est le dépôt d\'un avis sur la fiche d\'un artisan, suivi de sa ' +
            'relecture. Elle a été choisie parce qu\'elle traverse toute l\'application : le formulaire ' +
            'React en front-end, la validation et la logique métier en back-end, puis les deux bases de ' +
            'données — lecture de l\'artisan en SQL, écriture puis relecture de l\'avis en NoSQL.'
    ),
    p(
        'L\'objectif est de vérifier le parcours nominal (un avis bien enregistré et la note moyenne ' +
            'recalculée) ainsi que la robustesse de l\'API face à deux cas limites.'
    ),
    simpleTable(
        ['Cas', 'Données en entrée', 'Attendu', 'Obtenu'],
        [
            ['Nominal', 'Deux avis sur l\'artisan 1 : Claire (5/5) puis Marc (3/5).', '201 à chaque dépôt ; le GET renvoie count 2 et average 4.', 'Conforme (count 2, average 4).'],
            ['Saisie invalide', 'Un avis avec une note de 9 et un commentaire trop court.', '400 — erreur de validation.', 'Conforme (400, ValidationError).'],
            ['Base NoSQL indisponible', 'Dépôt d\'un avis alors que MongoDB est arrêté.', '503 — service indisponible.', 'Conforme (503).'],
        ],
        [1700, 3060, 2400, 2200]
    ),
    p(
        'Aucun écart entre l\'attendu et l\'obtenu. Le cas nominal et la saisie invalide sont couverts par ' +
            'la suite de tests automatisée (commande npm test) ; l\'indisponibilité de MongoDB a été ' +
            'vérifiée manuellement en arrêtant la base.'
    ),

    h2('3.11 Tests automatisés'),
    p(
        'Au-delà des tests de sécurité manuels (détaillés dans la veille), l\'API est couverte par une ' +
            'suite de tests automatisés, exécutée avec Mocha, Chai et Supertest. La base relationnelle de ' +
            'test utilise SQLite en mémoire et la base NoSQL un serveur MongoDB éphémère : les tests sont ' +
            'ainsi rapides et isolés, sans toucher à aucune base réelle. La suite couvre les trois volets du ' +
            'projet.'
    ),
    bullet('Artisans (SQL) : liste, fiche détaillée, artisan introuvable, recherche sans résultat.'),
    bullet('Avis (NoSQL) : liste vide au départ, dépôt d\'un avis, recalcul de la note moyenne, artisan inexistant.'),
    bullet('Sécurité : accès refusé sans clé d\'API ou avec une mauvaise clé, validation des entrées, route de santé publique.'),
    p('La suite compte onze tests, tous au vert (commande npm test).'),

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
        'Le formulaire de contact collecte le strict minimum (nom, e-mail, objet, message), et la table ' +
            'contact_messages les enregistre pour traçabilité. Une mention d\'information accompagne le ' +
            'formulaire : finalité (transmettre la demande à l\'artisan), destinataire (l\'artisan ' +
            'concerné), durée de conservation (12 mois) et droits d\'accès, de rectification et de ' +
            'suppression, exerçables via la page « Données personnelles ». Aucune donnée n\'est utilisée à ' +
            'des fins commerciales.'
    ),

    h3('4.2.4 Limitation du débit et anti-spam'),
    p(
        'Au-delà du middleware global, la route POST /api/artisans/:id/contact applique une limite plus ' +
            "stricte (5 envois / 15 min / IP). Combinée au caractère obligatoire de la clé d’API, elle " +
            'décourage les tentatives de spam massif visant les artisans.'
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
                ...competencesSection,
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
