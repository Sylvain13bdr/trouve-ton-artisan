/**
 * Page 404 affichée pour toute route inconnue.
 * Inclut un visuel, un message et un retour à l'accueil.
 */
import { Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';

export default function NotFoundPage() {
    return (
        <>
            <Seo
                title="Page non trouvée"
                description="La page que vous cherchez n'existe pas ou n'est plus disponible."
            />
            <section className="container not-found">
                <p className="not-found__code" aria-hidden="true">404</p>
                <h1 className="h3 mb-3">Page non trouvée</h1>
                <p className="mb-4">
                    La page que vous avez demandée n'existe pas, n'est plus disponible
                    ou a été déplacée.
                </p>
                <Link to="/" className="btn btn-primary">
                    Revenir à l'accueil
                </Link>
            </section>
        </>
    );
}
