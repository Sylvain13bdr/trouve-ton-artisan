/**
 * Carte (fiche résumée) d'un artisan pour les listes et la page d'accueil.
 * Toute la carte est cliquable (Link) tout en restant accessible au clavier.
 *
 * `headingLevel` permet d'adapter le niveau de titre du nom de l'artisan au
 * contexte (h2 sous un h1 de page, h3 sous une section h2), afin de respecter
 * la hiérarchie des titres (accessibilité / W3C).
 */
import { Link } from 'react-router-dom';
import Rating from './Rating.jsx';
import { categorySlug, initials } from '../utils/avatar.js';

export default function ArtisanCard({ artisan, headingLevel = 'h3' }) {
    const Heading = headingLevel;
    const specialty = artisan.specialty?.name || '';
    const category = artisan.specialty?.category?.name || '';
    const cityName = artisan.city?.name || '';
    const slug = categorySlug(category);

    return (
        <Link
            to={`/artisans/${artisan.id}`}
            className="artisan-card"
            aria-label={`Voir la fiche de ${artisan.name}, ${specialty} à ${cityName}`}
        >
            <div
                className={`artisan-card__image artisan-card__image--${slug}`}
                aria-hidden="true"
            >
                {artisan.imageUrl ? (
                    <img src={artisan.imageUrl} alt="" loading="lazy" />
                ) : (
                    <span className="artisan-card__initials">{initials(artisan.name)}</span>
                )}
            </div>
            <div className="artisan-card__body">
                <Heading className="artisan-card__name h6 mb-1">{artisan.name}</Heading>
                <Rating value={artisan.rating} />
                <p className="artisan-card__speciality mb-0">
                    {specialty}
                    {category && <span className="text-muted ms-1">· {category}</span>}
                </p>
                <p className="artisan-card__city mb-0">
                    <i className="bi bi-geo-alt me-1" aria-hidden="true" />
                    {cityName}
                </p>
            </div>
        </Link>
    );
}
