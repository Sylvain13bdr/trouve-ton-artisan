# Maquettes Figma — Trouve ton artisan

Document de référence pour la conception Figma : pages, composants,
palette, typographie et adaptations responsives.

## 1. Pages à maquetter

| Page                     | Breakpoints à produire           |
|--------------------------|----------------------------------|
| Accueil                  | Mobile 375 / Tablette 768 / Desktop 1280 |
| Liste des artisans       | Mobile 375 / Tablette 768 / Desktop 1280 |
| Fiche artisan + contact  | Mobile 375 / Tablette 768 / Desktop 1280 |
| Page 404                 | Mobile 375 / Desktop 1280               |
| Pages légales            | Mobile 375 / Desktop 1280               |

> Mobile-first : la maquette mobile est produite en premier, les versions
> plus larges en dérivent par ajout de colonnes et d'espace.

## 2. Charte graphique

### 2.1 Palette (cf. brief)

| Rôle               | Couleur   | Usage                            |
|--------------------|-----------|----------------------------------|
| Bleu très clair    | `#f1f8fc` | Fonds doux, sections secondaires |
| Bleu primaire      | `#0074c7` | Boutons, liens, accents          |
| Bleu foncé         | `#00497c` | Hover, accents forts             |
| Gris bleuté foncé  | `#384050` | Texte principal, footer          |
| Rouge              | `#cd2c2e` | Erreurs, alertes                 |
| Vert               | `#82b864` | Succès, validations              |

### 2.2 Typographie

- **Famille** : `Graphik`, auto-hébergée en woff2 sur le site (repli : `Inter`,
  polices système). `Inter` a servi de substitut dans les maquettes Figma,
  Graphik étant une police sous licence.
- **Tailles** :
  - H1 : 32–44 px (clamp pour le responsive)
  - H2 : 24–30 px
  - Body : 16 px
  - Petit : 14 px

### 2.3 Iconographie

- Bibliothèque **Bootstrap Icons** (cohérence avec le code).
- Icônes utilisées : `person-badge`, `star`, `star-half`, `star-fill`,
  `geo-alt`, `globe`, `search`.

## 3. Composants Figma

À créer en composants réutilisables :

- **Header** : logo + menu catégories + barre de recherche + bouton menu mobile (hamburger).
- **Footer** : adresse + tel + menu légal + copyright.
- **Carte artisan** (état repos / hover / focus).
- **Composant Rating** : 5 étoiles (pleine / demi / vide) + valeur numérique.
- **Bouton primaire** (3 états : repos / hover / désactivé).
- **Champ de formulaire** (état repos / erreur / succès).
- **Alerte** (info / succès / erreur).
- **Étape numérotée** (utilisée sur la page d'accueil).

## 4. Maquettes — descriptifs

### 4.1 Accueil — mobile

1. Header sticky : logo seul + icône menu, barre de recherche en dessous.
2. Hero : H1 + sous-titre + bouton « Voir tous les artisans » (largeur 100 %).
3. Section « Comment trouver mon artisan ? » : 4 cartes empilées (une par ligne).
4. Section « Artisans du mois » : 3 cartes empilées.
5. Footer : 3 blocs empilés (présentation, adresse, liens légaux), © en bas.

### 4.2 Accueil — desktop

1. Header : logo + menu horizontal + barre de recherche à droite.
2. Hero : 2 colonnes (texte à gauche, illustration à droite).
3. Section étapes : 4 cartes sur 1 ligne.
4. Artisans du mois : 3 cartes sur 1 ligne.
5. Footer : 3 colonnes côte à côte.

### 4.3 Liste des artisans

- Filtre actif affiché en titre (« Bâtiment », « Résultats pour "duf" »).
- Grille de cartes (1 col mobile / 2 col tablette / 3 col desktop).
- Empty state si aucun résultat.

### 4.4 Fiche artisan

- Fil d'Ariane : Accueil > Catégorie > Nom artisan.
- 2 colonnes desktop : visuel à gauche, informations à droite ;
  empilées en mobile.
- Bloc « À propos », bouton site web si présent.
- Formulaire de contact en dessous (Nom, Email, Objet, Message).

### 4.5 Page 404

- Grand chiffre `404` en bleu primaire.
- Texte « Page non trouvée » + paragraphe.
- Bouton « Revenir à l'accueil ».

## 5. Lien Figma

> Le fichier Figma est publié en lecture seule :
>
> **URL Figma** : <https://www.figma.com/design/vch2TgFsEjaY9O7gjnNakX/Trouve-ton-Artisan>

## 6. Schéma d'enchaînement

```
[Accueil]
   ├─ menu catégorie ─────────→ [Liste filtrée par catégorie]
   ├─ recherche ──────────────→ [Liste filtrée par recherche]
   ├─ « Voir tous » ──────────→ [Liste complète]
   └─ artisan du mois ────────→ [Fiche artisan] ──→ [Formulaire de contact] ──→ confirmation in-page

[Liste filtrée]
   ├─ clic carte ─────────────→ [Fiche artisan]
   └─ menu / recherche / logo → autres pages

[Toute URL inconnue] ─────────→ [404] ──→ retour [Accueil]

[Footer]
   ├─ Mentions légales        → [Page en construction]
   ├─ Données personnelles    → [Page en construction]
   ├─ Accessibilité           → [Page en construction]
   └─ Cookies                 → [Page en construction]
```
