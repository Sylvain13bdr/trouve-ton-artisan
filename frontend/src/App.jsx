/**
 * Routeur principal de l'application.
 * Toutes les routes sont rendues à l'intérieur du Layout commun.
 */
import { Routes, Route } from 'react-router-dom';

import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import ArtisansListPage from './pages/ArtisansListPage.jsx';
import ArtisanDetailPage from './pages/ArtisanDetailPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/artisans" element={<ArtisansListPage />} />
                <Route path="/artisans/:id" element={<ArtisanDetailPage />} />
                <Route path="/mentions-legales" element={<LegalPage title="Mentions légales" />} />
                <Route path="/donnees-personnelles" element={<LegalPage title="Données personnelles" />} />
                <Route path="/accessibilite" element={<LegalPage title="Accessibilité" />} />
                <Route path="/cookies" element={<LegalPage title="Cookies" />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
