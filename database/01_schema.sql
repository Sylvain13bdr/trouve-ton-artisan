-- =====================================================================
-- Trouve ton artisan - Script de création de la base de données
-- Auteur : Sylvain Labeye (CEF)
-- SGBD   : MySQL 8.x / MariaDB 10.x
-- =====================================================================

-- 1. Création de la base
DROP DATABASE IF EXISTS trouve_ton_artisan;
CREATE DATABASE trouve_ton_artisan
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE trouve_ton_artisan;

-- 2. Table des catégories d'artisanat
-- Bâtiment, Services, Fabrication, Alimentation
CREATE TABLE categories (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table des spécialités
-- Une spécialité est rattachée à une seule catégorie (1,n)
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

-- 4. Table des artisans
-- Un artisan apparaît dans une seule spécialité (1,n)
CREATE TABLE artisans (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    rating          DECIMAL(2,1) NOT NULL DEFAULT 0.0,
    city            VARCHAR(120) NOT NULL,
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
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_artisan_specialty ON artisans(specialty_id);
CREATE INDEX idx_artisan_name      ON artisans(name);
CREATE INDEX idx_artisan_top       ON artisans(is_top_of_month);

-- 5. Journal des messages de contact (traçabilité côté plateforme)
-- Permet de garder une trace des demandes envoyées via le formulaire.
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

-- 6. Vue pratique pour le frontend (lecture seule, jointures pré-faites)
CREATE OR REPLACE VIEW v_artisans_full AS
SELECT
    a.id              AS artisan_id,
    a.name            AS artisan_name,
    a.rating,
    a.city,
    a.about,
    a.email,
    a.website,
    a.image_url,
    a.is_top_of_month,
    s.id              AS specialty_id,
    s.name            AS specialty_name,
    c.id              AS category_id,
    c.name            AS category_name
FROM artisans a
JOIN specialties s ON s.id = a.specialty_id
JOIN categories  c ON c.id = s.category_id;
