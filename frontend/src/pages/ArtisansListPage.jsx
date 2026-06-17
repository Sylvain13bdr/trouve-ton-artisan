/**
 * Page liste des artisans selon une catégorie ou une recherche.
 * Les filtres sont entièrement gérés via les query string (URL partageable).
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ArtisanCard from '../components/ArtisanCard.jsx';
import { api } from '../api/client.js';

export default function ArtisansListPage() {
    const [searchParams] = useSearchParams();
    const category = searchParams.get('category') || '';
    const q = searchParams.get('q') || '';

    const [artisans, setArtisans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        api.getArtisans({ category: category || undefined, q: q || undefined })
            .then((data) => {
                if (!cancelled) setArtisans(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [category, q]);

    let title = 'Tous les artisans';
    if (category && q) title = `« ${q} » dans ${category}`;
    else if (category) title = `Artisans — ${category}`;
    else if (q) title = `Résultats pour « ${q} »`;

    return (
        <>
            <Seo
                title={title}
                description={`Liste des artisans${category ? ` de la catégorie ${category}` : ''} en Auvergne-Rhône-Alpes.`}
            />

            <section className="container py-5">
                <h1 className="h2 mb-4">{title}</h1>

                {loading && <p>Chargement des artisans…</p>}

                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}

                {!loading && !error && artisans.length === 0 && (
                    <div className="alert alert-info" role="status">
                        Aucun artisan ne correspond à votre recherche.
                    </div>
                )}

                {!loading && !error && artisans.length > 0 && (
                    <>
                        <p className="text-muted">
                            {artisans.length} artisan{artisans.length > 1 ? 's' : ''} trouvé
                            {artisans.length > 1 ? 's' : ''}.
                        </p>
                        <div className="row g-4">
                            {artisans.map((artisan) => (
                                <div key={artisan.id} className="col-sm-6 col-lg-4">
                                    <ArtisanCard artisan={artisan} headingLevel="h2" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </>
    );
}
