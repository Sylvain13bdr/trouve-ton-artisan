/**
 * Page légale générique (mentions, données personnelles, accessibilité, cookies).
 * Le contenu définitif sera rédigé plus tard par un cabinet spécialisé.
 */
import Seo from '../components/Seo.jsx';

export default function LegalPage({ title }) {
    return (
        <>
            <Seo title={title} description={`${title} de la plateforme Trouve ton artisan.`} />
            <section className="container py-5">
                <h1 className="h2 mb-3">{title}</h1>
                <p className="lead">Page en construction.</p>
                <p>
                    Le contenu de cette page sera rédigé prochainement par un cabinet
                    spécialisé puis publié sur la plateforme.
                </p>
            </section>
        </>
    );
}
