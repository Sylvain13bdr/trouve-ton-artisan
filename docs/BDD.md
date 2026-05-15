# Base de données — Trouve ton artisan

## 1. Règles de gestion

Issues du brief :

- **RG1** : Un artisan apparaît dans **une seule** spécialité.
- **RG2** : Une spécialité est rattachée à **une seule** catégorie.
- **RG3** : Un artisan peut être marqué comme « artisan du mois ».
- **RG4** : Chaque artisan possède une note sur 5 (peut être décimale).
- **RG5** : Un message de contact est associé à **un seul** artisan ;
  un artisan peut recevoir plusieurs messages.

## 2. Modèle Conceptuel de Données (MCD)

Notation Merise (entités et associations).

```
+-----------------+        1,n           1,1        +------------------+
|   CATEGORIE     |---------------< rattachée à >---|    SPECIALITE    |
+-----------------+                                  +------------------+
| id (PK)         |                                  | id (PK)          |
| nom             |                                  | nom              |
+-----------------+                                  +------------------+
                                                              | 1,n
                                                              |
                                                  < pratiquée >
                                                              |
                                                              | 1,1
                                                     +------------------+
                                                     |     ARTISAN      |
                                                     +------------------+
                                                     | id (PK)          |
                                                     | nom              |
                                                     | note             |
                                                     | ville            |
                                                     | a_propos         |
                                                     | email            |
                                                     | site_web         |
                                                     | image_url        |
                                                     | top_du_mois      |
                                                     +------------------+
                                                              | 1,n
                                                              |
                                                  < destinataire de >
                                                              |
                                                              | 1,1
                                                     +------------------+
                                                     | MESSAGE_CONTACT  |
                                                     +------------------+
                                                     | id (PK)          |
                                                     | expediteur_nom   |
                                                     | expediteur_email |
                                                     | objet            |
                                                     | message          |
                                                     | date_envoi       |
                                                     +------------------+
```

## 3. Modèle Logique de Données (MLD)

```
categories       (id, nom)
specialties      (id, nom, #category_id)
artisans         (id, nom, note, ville, a_propos, email, site_web, image_url,
                  top_du_mois, #specialty_id)
contact_messages (id, expediteur_nom, expediteur_email, objet, message,
                  date_envoi, #artisan_id)
```

Conventions : `id` = clé primaire, `#xxx` = clé étrangère.

## 4. Modèle Physique de Données (MPD)

Implémenté en MySQL 8 / MariaDB 10 — voir `database/01_schema.sql`.

Points-clés :

- Toutes les tables sont en **InnoDB** + jeu de caractères **utf8mb4**.
- Clés étrangères avec `ON DELETE RESTRICT` sur les tables référentielles
  (catégories, spécialités) et `ON DELETE CASCADE` sur les messages
  (suppression d'un artisan ⇒ purge de ses messages).
- Index supplémentaires sur `artisans.name`, `artisans.is_top_of_month` et
  les clés étrangères, pour accélérer les recherches.
- Contraintes CHECK :
  - `rating BETWEEN 0 AND 5`
  - `email LIKE '%_@_%.__%'` (filtre simple, validation complète côté API)
- Vue **`v_artisans_full`** : joint artisan + spécialité + catégorie pour
  simplifier la lecture côté front.

## 5. Jeu d'essai

- 4 catégories : Bâtiment, Services, Fabrication, Alimentation
- 15 spécialités
- 17 artisans (3 marqués « artisan du mois »)

Données issues du fichier `data.xlsx` fourni dans le brief
(cf. `database/02_seed.sql`).
