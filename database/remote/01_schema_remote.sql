-- =====================================================================
-- Trouve ton artisan - Script de création des tables (PROD / DISTANT)
-- Variante pour hébergeur qui impose un nom de base préfixé
-- (AlwaysData, Clever Cloud, Aiven...). La base doit déjà exister :
-- on exécute ce script EN ÉTANT CONNECTÉ DESSUS.
-- =====================================================================

-- Nettoyage si on relance (ordre inverse des dépendances)
DROP VIEW  IF EXISTS v_artisans_full;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS artisans;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS specialties;
DROP TABLE IF EXISTS categories;

-- 1. Catégories
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Spécialités
CREATE TABLE specialties (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(80)  NOT NULL,
    category_id  INT UNSIGNED NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_specialty_name UNIQUE (name),
    CONSTRAINT fk_specialty_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_specialty_category ON specialties(category_id);

-- 3. Villes (3FN : externaliser pour éviter la redondance)
CREATE TABLE cities (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(120) NOT NULL UNIQUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Artisans
CREATE TABLE artisans (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    rating          DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    city_id         INT UNSIGNED NOT NULL,
    about           TEXT         NULL,
    email           VARCHAR(180) NOT NULL,
    website         VARCHAR(255) NULL,
    image_url       VARCHAR(255) NULL,
    specialty_id    INT UNSIGNED NOT NULL,
    is_top_of_month BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_artisan_rating CHECK (rating >= 0.0 AND rating <= 5.0),
    CONSTRAINT chk_artisan_email  CHECK (email LIKE '%_@_%.__%'),
    CONSTRAINT fk_artisan_specialty
        FOREIGN KEY (specialty_id) REFERENCES specialties(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_artisan_city
        FOREIGN KEY (city_id) REFERENCES cities(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_artisan_specialty ON artisans(specialty_id);
CREATE INDEX idx_artisan_city      ON artisans(city_id);
CREATE INDEX idx_artisan_name      ON artisans(name);
CREATE INDEX idx_artisan_top       ON artisans(is_top_of_month);

-- 5. Messages de contact
CREATE TABLE contact_messages (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    artisan_id   INT UNSIGNED NOT NULL,
    sender_name  VARCHAR(120) NOT NULL,
    sender_email VARCHAR(180) NOT NULL,
    subject      VARCHAR(180) NOT NULL,
    message      TEXT         NOT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_artisan
        FOREIGN KEY (artisan_id) REFERENCES artisans(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_contact_artisan ON contact_messages(artisan_id);

-- 6. Vue pratique pour le frontend
CREATE OR REPLACE VIEW v_artisans_full AS
SELECT
    a.id              AS artisan_id,
    a.name            AS artisan_name,
    a.rating,
    a.about,
    a.email,
    a.website,
    a.image_url,
    a.is_top_of_month,
    s.id              AS specialty_id,
    s.name            AS specialty_name,
    c.id              AS category_id,
    c.name            AS category_name,
    ci.id             AS city_id,
    ci.name           AS city_name
FROM artisans a
JOIN specialties s ON s.id = a.specialty_id
JOIN categories  c ON c.id = s.category_id
JOIN cities     ci ON ci.id = a.city_id;
