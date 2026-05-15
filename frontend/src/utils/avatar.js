/**
 * Helpers d'affichage : slug normalisé d'une catégorie et initiales d'un nom.
 * Utilisés pour générer un avatar coloré à partir du nom d'un artisan
 * lorsqu'aucune image n'est fournie en base.
 */

const CATEGORY_SLUGS = {
    Alimentation: 'alimentation',
    Bâtiment: 'batiment',
    Batiment: 'batiment',
    Services: 'services',
    Fabrication: 'fabrication',
};

export function categorySlug(name) {
    if (!name) return 'default';
    return CATEGORY_SLUGS[name] || 'default';
}

/**
 * Renvoie 1 à 2 lettres représentatives du nom : majuscules des deux premiers
 * mots, ou les deux premières lettres si un seul mot.
 */
export function initials(fullName) {
    if (!fullName) return '??';
    const cleaned = String(fullName).trim();
    const words = cleaned.split(/\s+/).filter(Boolean);
    if (words.length === 1) {
        return cleaned.slice(0, 2).toUpperCase();
    }
    return (words[0][0] + words[1][0]).toUpperCase();
}
