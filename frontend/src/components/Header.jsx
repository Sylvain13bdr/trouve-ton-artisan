/**
 * Header global : logo cliquable, menu des catégories (depuis l'API),
 * barre de recherche par nom d'artisan. Identique sur toutes les pages.
 */
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function Header() {
    const [categories, setCategories] = useState([]);
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        api.getCategories()
            .then((data) => {
                if (!cancelled) setCategories(data);
            })
            .catch(() => {
                // En cas d'échec on garde une liste vide : le header reste utilisable.
            });
        return () => {
            cancelled = true;
        };
    }, []);

    function handleSubmit(e) {
        e.preventDefault();
        const trimmed = query.trim();
        if (trimmed.length === 0) return;
        navigate(`/artisans?q=${encodeURIComponent(trimmed)}`);
    }

    return (
        <header className="site-header sticky-top">
            <a className="skip-link" href="#main-content">
                Aller au contenu principal
            </a>
            <nav
                className="navbar navbar-expand-lg container py-2"
                aria-label="Navigation principale"
            >
                <Link to="/" className="navbar-brand" aria-label="Trouve ton artisan — Retour à l'accueil">
                    <img
                        src="/images/logo.png"
                        alt="Trouve ton artisan — Avec la région Auvergne-Rhône-Alpes"
                        className="site-logo"
                    />
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#mainNav"
                    aria-controls="mainNav"
                    aria-expanded="false"
                    aria-label="Ouvrir le menu"
                >
                    <span className="navbar-toggler-icon" />
                </button>

                <div className="collapse navbar-collapse" id="mainNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {categories.map((cat) => (
                            <li key={cat.id} className="nav-item">
                                <NavLink
                                    to={`/artisans?category=${encodeURIComponent(cat.name)}`}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {cat.name}
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    <form
                        role="search"
                        className="d-flex"
                        onSubmit={handleSubmit}
                        aria-label="Rechercher un artisan"
                    >
                        <label htmlFor="search-input" className="visually-hidden">
                            Rechercher un artisan par nom
                        </label>
                        <input
                            id="search-input"
                            type="search"
                            className="form-control me-2"
                            placeholder="Rechercher un artisan…"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            maxLength={80}
                        />
                        <button className="btn btn-primary" type="submit">
                            <i className="bi bi-search me-1" aria-hidden="true" />
                            Chercher
                        </button>
                    </form>
                </div>
            </nav>
        </header>
    );
}
