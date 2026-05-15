/**
 * Footer global : adresse de l'antenne de Lyon, contact téléphonique,
 * menu des pages légales (placeholders, à compléter ultérieurement).
 */
import { Link } from 'react-router-dom';

const legalLinks = [
    { to: '/mentions-legales', label: 'Mentions légales' },
    { to: '/donnees-personnelles', label: 'Données personnelles' },
    { to: '/accessibilite', label: 'Accessibilité' },
    { to: '/cookies', label: 'Cookies' },
];

export default function Footer() {
    return (
        <footer className="site-footer" role="contentinfo">
            <div className="container">
                <div className="row gy-4">
                    <div className="col-md-5">
                        <h2 className="h5">Trouve ton artisan</h2>
                        <p className="mb-0">
                            Plateforme officielle de la région Auvergne-Rhône-Alpes
                            pour mettre en relation particuliers et artisans locaux.
                        </p>
                    </div>

                    <div className="col-md-4">
                        <h2 className="h6">Antenne de Lyon</h2>
                        <address className="mb-0 fst-normal">
                            101 cours Charlemagne<br />
                            CS 20033<br />
                            69269 LYON CEDEX 02<br />
                            France<br />
                            <a href="tel:+33426734000">+33 (0)4 26 73 40 00</a>
                        </address>
                    </div>

                    <div className="col-md-3">
                        <h2 className="h6">Informations</h2>
                        <ul className="list-unstyled mb-0">
                            {legalLinks.map((link) => (
                                <li key={link.to}>
                                    <Link to={link.to}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom text-center">
                    © {new Date().getFullYear()} Région Auvergne-Rhône-Alpes — Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
