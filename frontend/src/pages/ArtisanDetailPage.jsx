/**
 * Page fiche artisan : informations détaillées + formulaire de contact.
 * Validation client (HTML5 + JS) qui complète la validation serveur.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Seo from '../components/Seo.jsx';
import Rating from '../components/Rating.jsx';
import { api } from '../api/client.js';
import { categorySlug, initials } from '../utils/avatar.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm() {
    return { name: '', email: '', subject: '', message: '' };
}

export default function ArtisanDetailPage() {
    const { id } = useParams();
    const [artisan, setArtisan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [submitOk, setSubmitOk] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.getArtisan(id)
            .then((data) => {
                if (!cancelled) setArtisan(data);
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
    }, [id]);

    function validate() {
        const e = {};
        if (form.name.trim().length < 2) e.name = 'Votre nom est requis (2 caractères minimum).';
        if (!EMAIL_RE.test(form.email.trim())) e.email = "Adresse e-mail invalide.";
        if (form.subject.trim().length < 2) e.subject = "L'objet est requis.";
        if (form.message.trim().length < 10) e.message = 'Votre message doit faire au moins 10 caractères.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setSubmitMessage(null);
        setSubmitOk(false);
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await api.postContact(id, {
                name: form.name.trim(),
                email: form.email.trim(),
                subject: form.subject.trim(),
                message: form.message.trim(),
            });
            setSubmitOk(true);
            setSubmitMessage(res.message || 'Votre message a bien été envoyé.');
            setForm(emptyForm());
        } catch (err) {
            setSubmitOk(false);
            setSubmitMessage(err.message || "Erreur lors de l'envoi du message.");
        } finally {
            setSubmitting(false);
        }
    }

    function update(field) {
        return (event) => setForm({ ...form, [field]: event.target.value });
    }

    if (loading) {
        return (
            <section className="container py-5">
                <p>Chargement de la fiche artisan…</p>
            </section>
        );
    }

    if (error || !artisan) {
        return (
            <section className="container py-5">
                <Seo title="Erreur" />
                <div className="alert alert-danger" role="alert">
                    {error || 'Artisan introuvable.'}
                </div>
                <Link to="/artisans" className="btn btn-outline-primary">
                    Retour à la liste
                </Link>
            </section>
        );
    }

    const specialty = artisan.specialty?.name || '';
    const category = artisan.specialty?.category?.name || '';
    const cityName = artisan.city?.name || '';

    return (
        <>
            <Seo
                title={artisan.name}
                description={`${artisan.name}, ${specialty} à ${cityName}. Contactez cet artisan via Trouve ton artisan.`}
            />

            <section className="container py-5 artisan-detail">
                <nav aria-label="Fil d'Ariane" className="mb-3">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Accueil</Link></li>
                        <li className="breadcrumb-item">
                            <Link to={`/artisans?category=${encodeURIComponent(category)}`}>{category}</Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">{artisan.name}</li>
                    </ol>
                </nav>

                <div className="row g-4">
                    <div className="col-lg-5">
                        <div
                            className={`artisan-detail__cover artisan-detail__cover--${categorySlug(category)}`}
                            aria-hidden="true"
                        >
                            {artisan.imageUrl ? (
                                <img
                                    src={artisan.imageUrl}
                                    alt={`Visuel de ${artisan.name}`}
                                    className="artisan-detail__image"
                                />
                            ) : (
                                <span className="artisan-detail__initials">
                                    {initials(artisan.name)}
                                </span>
                            )}
                            <p className="mt-3 mb-0 fw-semibold">{specialty}</p>
                        </div>
                    </div>

                    <div className="col-lg-7">
                        <h1 className="h2 mb-2">{artisan.name}</h1>
                        <Rating value={artisan.rating} />
                        <p className="artisan-detail__meta mt-3">
                            <span><strong>Spécialité :</strong> {specialty}</span>
                            <span><strong>Catégorie :</strong> {category}</span>
                            <span><strong>Ville :</strong> {cityName}</span>
                        </p>

                        <h2 className="h4 mt-4">À propos</h2>
                        <p>{artisan.about}</p>

                        {artisan.website && (
                            <p>
                                <i className="bi bi-globe me-2" aria-hidden="true" />
                                <a href={artisan.website} target="_blank" rel="noreferrer noopener">
                                    Visiter le site web
                                </a>
                            </p>
                        )}
                    </div>
                </div>

                <h2 className="h4 mt-5 mb-3">Contacter {artisan.name}</h2>
                <p className="text-muted">Une réponse vous sera apportée sous 48&nbsp;h.</p>

                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label htmlFor="contact-name" className="form-label">Nom *</label>
                            <input
                                id="contact-name"
                                type="text"
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                value={form.name}
                                onChange={update('name')}
                                required
                                minLength={2}
                                maxLength={120}
                                aria-describedby={errors.name ? 'err-name' : undefined}
                            />
                            {errors.name && <div id="err-name" className="invalid-feedback">{errors.name}</div>}
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="contact-email" className="form-label">E-mail *</label>
                            <input
                                id="contact-email"
                                type="email"
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                value={form.email}
                                onChange={update('email')}
                                required
                                maxLength={180}
                                aria-describedby={errors.email ? 'err-email' : undefined}
                            />
                            {errors.email && <div id="err-email" className="invalid-feedback">{errors.email}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="contact-subject" className="form-label">Objet *</label>
                            <input
                                id="contact-subject"
                                type="text"
                                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                value={form.subject}
                                onChange={update('subject')}
                                required
                                minLength={2}
                                maxLength={180}
                                aria-describedby={errors.subject ? 'err-subject' : undefined}
                            />
                            {errors.subject && <div id="err-subject" className="invalid-feedback">{errors.subject}</div>}
                        </div>

                        <div className="col-12">
                            <label htmlFor="contact-message" className="form-label">Message *</label>
                            <textarea
                                id="contact-message"
                                rows="6"
                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                value={form.message}
                                onChange={update('message')}
                                required
                                minLength={10}
                                maxLength={5000}
                                aria-describedby={errors.message ? 'err-message' : undefined}
                            />
                            {errors.message && <div id="err-message" className="invalid-feedback">{errors.message}</div>}
                        </div>
                    </div>

                    {submitMessage && (
                        <div
                            className={`alert mt-3 ${submitOk ? 'alert-success' : 'alert-danger'}`}
                            role={submitOk ? 'status' : 'alert'}
                            aria-live="polite"
                        >
                            {submitMessage}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                        {submitting ? 'Envoi en cours…' : 'Envoyer le message'}
                    </button>
                </form>
            </section>
        </>
    );
}
