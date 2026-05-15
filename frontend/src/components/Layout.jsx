/**
 * Layout commun à toutes les pages : header, contenu principal, footer.
 * Le balisage `<main>` est annoncé pour les lecteurs d'écran.
 */
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
    return (
        <>
            <Header />
            <main id="main-content" tabIndex="-1">
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
