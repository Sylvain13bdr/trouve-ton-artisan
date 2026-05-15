/**
 * Petit composant utilitaire pour ajouter un titre et une meta-description
 * propres à chaque page (référencement / partage social).
 */
import { Helmet } from 'react-helmet-async';

export default function Seo({ title, description }) {
    const fullTitle = title
        ? `${title} — Trouve ton artisan`
        : 'Trouve ton artisan — Région Auvergne-Rhône-Alpes';

    return (
        <Helmet>
            <title>{fullTitle}</title>
            {description && <meta name="description" content={description} />}
            <meta property="og:title" content={fullTitle} />
            {description && <meta property="og:description" content={description} />}
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}
