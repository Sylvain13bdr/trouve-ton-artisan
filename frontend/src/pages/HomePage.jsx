/**
 * Page d'accueil :
 *  - explication étape par étape « Comment trouver mon artisan ? »
 *  - les trois artisans du mois (récupérés via l'API).
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import ArtisanCard from '../components/ArtisanCard.jsx';
import { api } from '../api/client.js';

const STEPS = [
    { number: 1, text: "Choisir la catégorie d'artisanat dans le menu." },
    { number: 2, text: 'Choisir un artisan.' },
    { number: 3, text: 'Le contacter via le formulaire de contact.' },
    { number: 4, text: 'Une réponse sera apportée sous 48h.' },
];

export default function HomePage() {
    const [top, setTop] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        api.getTopOfMonth()
            .then((data) => {
                if (!cancelled) setTop(data);
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
    }, []);

    return (
        <>
            <Seo
                title="Accueil"
                description="Trouvez l'artisan qu'il vous faut en Auvergne-Rhône-Alpes : bâtiment, alimentation, services, fabrication."
            />

            <section className="hero">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <h1>Trouvez l'artisan qu'il vous faut, près de chez vous.</h1>
                            <p className="lead mt-3">
                                Bâtiment, alimentation, services, fabrication : plus de
                                221&nbsp;000 entreprises artisanales rayonnent en Auvergne-Rhône-Alpes.
                                Notre plateforme vous met en relation avec celui ou celle qu'il vous faut.
                            </p>
                            <Link to="/artisans" className="btn btn-primary btn-lg mt-2">
                                Voir tous les artisans
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5 steps" aria-labelledby="steps-title">
                <h2 id="steps-title" className="text-center mb-4">
                    Comment trouver mon artisan&nbsp;?
                </h2>
                <ol className="row g-3 list-unstyled" role="list">
                    {STEPS.map((s) => (
                        <li key={s.number} className="col-md-6 col-lg-3">
                            <div className="step-card">
                                <span className="step-number" aria-hidden="true">
                                    {s.number}
                                </span>
                                <p className="mb-0">
                                    <span className="visually-hidden">Étape {s.number} : </span>
                                    {s.text}
                                </p>
                            </div>
                        </li>
                    ))}
                </ol>
            </section>

            <section className="container py-5" aria-labelledby="top-title">
                <h2 id="top-title" className="mb-4">
                    Les artisans du mois
                </h2>

                {loading && <p>Chargement…</p>}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        Impossible de récupérer les artisans : {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="row g-4">
                        {top.map((artisan) => (
                            <div key={artisan.id} className="col-md-6 col-lg-4">
                                <ArtisanCard artisan={artisan} />
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}
