-- =====================================================================
-- Trouve ton artisan - Script d'alimentation (PROD / DISTANT)
-- À exécuter EN ÉTANT CONNECTÉ SUR LA BASE déjà créée.
-- =====================================================================

-- Nettoyage (relance idempotente)
-- MariaDB ignore FOREIGN_KEY_CHECKS pour TRUNCATE : on utilise DELETE FROM
-- + ALTER ... AUTO_INCREMENT = 1 pour réinitialiser les compteurs.
SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM contact_messages;
DELETE FROM artisans;
DELETE FROM cities;
DELETE FROM specialties;
DELETE FROM categories;
ALTER TABLE contact_messages AUTO_INCREMENT = 1;
ALTER TABLE artisans         AUTO_INCREMENT = 1;
ALTER TABLE cities           AUTO_INCREMENT = 1;
ALTER TABLE specialties      AUTO_INCREMENT = 1;
ALTER TABLE categories       AUTO_INCREMENT = 1;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Catégories (ordre = ordre du menu)
INSERT INTO categories (id, name) VALUES
    (1, 'Bâtiment'),
    (2, 'Services'),
    (3, 'Fabrication'),
    (4, 'Alimentation');

-- 2. Spécialités
INSERT INTO specialties (id, name, category_id) VALUES
    (1, 'Chauffagiste',  1),
    (2, 'Electricien',   1),
    (3, 'Menuisier',     1),
    (4, 'Plombier',      1),
    (5, 'Coiffeur',      2),
    (6, 'Fleuriste',     2),
    (7, 'Toiletteur',    2),
    (8, 'Webdesign',     2),
    (9,  'Bijoutier',    3),
    (10, 'Couturier',    3),
    (11, 'Ferronier',    3),
    (12, 'Boucher',      4),
    (13, 'Boulanger',    4),
    (14, 'Chocolatier',  4),
    (15, 'Traiteur',     4);

-- 3. Villes (14 villes uniques)
INSERT INTO cities (id, name) VALUES
    (1,  'Lyon'),
    (2,  'Montélimar'),
    (3,  'Evian'),
    (4,  'Chamonix'),
    (5,  'Bourg-en-bresse'),
    (6,  'Vienne'),
    (7,  'Aix-les-bains'),
    (8,  'Annecy'),
    (9,  'Le Puy-en-Velay'),
    (10, 'Saint-Priest'),
    (11, 'Chambéry'),
    (12, 'Romans-sur-Isère'),
    (13, 'Annonay'),
    (14, 'Valence');

-- 4. Artisans
SET @about := 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus eleifend ante sem, id volutpat massa fermentum nec. Praesent volutpat scelerisque mauris, quis sollicitudin tellus sollicitudin.';

INSERT INTO artisans
    (name, rating, city_id, about, email, website, specialty_id, is_top_of_month)
VALUES
    ('Boucherie Dumont',      4.5,  1, @about, 'boucherie.dumond@gmail.com',           NULL,                                       12, FALSE),
    ('Au pain chaud',         4.8,  2, @about, 'aupainchaud@hotmail.com',              NULL,                                       13, TRUE),
    ('Chocolaterie Labbé',    4.9,  1, @about, 'chocolaterie-labbe@gmail.com',         'https://chocolaterie-labbe.fr',            14, TRUE),
    ('Traiteur Truchon',      4.1,  1, @about, 'contact@truchon-traiteur.fr',          'https://truchon-traiteur.fr',              15, FALSE),
    ('Orville Salmons',       5.0,  3, @about, 'o-salmons@live.com',                   NULL,                                        1, TRUE),
    ('Mont Blanc Eléctricité',4.5,  4, @about, 'contact@mont-blanc-electricite.com',   'https://mont-blanc-electricite.com',        2, FALSE),
    ('Boutot & fils',         4.7,  5, @about, 'boutot-menuiserie@gmail.com',          'https://boutot-menuiserie.com',             3, FALSE),
    ('Vallis Bellemare',      4.0,  6, @about, 'v.bellemare@gmail.com',                'https://plomberie-bellemare.com',           4, FALSE),
    ('Claude Quinn',          4.2,  7, @about, 'claude.quinn@gmail.com',               NULL,                                        9, FALSE),
    ('Amitee Lécuyer',        4.5,  8, @about, 'a.amitee@hotmail.com',                 'https://lecuyer-couture.com',              10, FALSE),
    ('Ernest Carignan',       5.0,  9, @about, 'e-carigan@hotmail.com',                NULL,                                       11, FALSE),
    ('Royden Charbonneau',    3.8, 10, @about, 'r.charbonneau@gmail.com',              NULL,                                        5, FALSE),
    ('Leala Dennis',          3.8, 11, @about, 'l.dennos@hotmail.fr',                  'https://coiffure-leala-chambery.fr',        5, FALSE),
    ('C''est sup''hair',      4.1, 12, @about, 'sup-hair@gmail.com',                   'https://sup-hair.fr',                       5, FALSE),
    ('Le monde des fleurs',   4.6, 13, @about, 'contact@le-monde-des-fleurs-annonay.fr','https://le-monde-des-fleurs-annonay.fr',   6, FALSE),
    ('Valérie Laderoute',     4.5, 14, @about, 'v-laredoute@gmail.com',                NULL,                                        7, FALSE),
    ('CM Graphisme',          4.4, 14, @about, 'contact@cm-graphisme.com',             'https://cm-graphisme.com',                  8, FALSE);
