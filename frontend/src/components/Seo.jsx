/**
 * Composant utilitaire : titre et meta-données propres à chaque page
 * (référencement / partage social).
 *
 * Utilise les métadonnées natives de React 19 : les balises <title> et
 * <meta> rendues ici sont automatiquement hissées dans le <head> du
 * document, ce qui évite une dépendance externe (react-helmet-async).
 */
export default function Seo({ title, description }) {
    const fullTitle = title
        ? `${title} — Trouve ton artisan`
        : 'Trouve ton artisan — Région Auvergne-Rhône-Alpes';

    return (
        <>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            <meta property="og:title" content={fullTitle} />
            {description && <meta property="og:description" content={description} />}
            <meta name="robots" content="index, follow" />
        </>
    );
}
