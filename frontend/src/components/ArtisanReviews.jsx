/**
 * Avis clients d'un artisan (données NoSQL / MongoDB).
 * Affiche la note moyenne, la liste des avis et un formulaire de dépôt.
 * Complète la fiche artisan (données relationnelles SQL) par une source NoSQL.
 */
import { useEffect, useState } from 'react';
import Rating from './Rating.jsx';
import { api } from '../api/client.js';

function emptyForm() {
    return { authorName: '', rating: '5', comment: '' };
}

function formatDate(value) {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ArtisanReviews({ artisanId }) {
    const [data, setData] = useState({ items: [], count: 0, average: null });
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const [form, setForm] = useState(emptyForm());
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [feedbackOk, setFeedbackOk] = useState(false);

    useEffect(() => {
        let active = true;
        setLoading(true);
        setLoadError(null);
        api.getReviews(artisanId)
            .then((res) => { if (active) setData(res); })
            .catch((err) => { if (active) setLoadError(err.message); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [artisanId, refreshKey]);

    function validate() {
        const e = {};
        if (form.authorName.trim().length < 2) e.authorName = 'Votre nom est requis (2 caractères minimum).';
        const rating = Number(form.rating);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) e.rating = 'Note invalide.';
        if (form.comment.trim().length < 10) e.comment = 'Votre avis doit faire au moins 10 caractères.';
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFeedback(null);
        setFeedbackOk(false);
        if (!validate()) return;

        setSubmitting(true);
        try {
            await api.postReview(artisanId, {
                authorName: form.authorName.trim(),
                rating: Number(form.rating),
                comment: form.comment.trim(),
            });
            setFeedbackOk(true);
            setFeedback('Merci, votre avis a bien été publié.');
            setForm(emptyForm());
            setErrors({});
            setRefreshKey((k) => k + 1);
        } catch (err) {
            setFeedbackOk(false);
            setFeedback(err.message || "Erreur lors de l'envoi de votre avis.");
        } finally {
            setSubmitting(false);
        }
    }

    function update(field) {
        return (event) => setForm({ ...form, [field]: event.target.value });
    }

    return (
        <section className="artisan-reviews mt-5" aria-labelledby="reviews-title">
            <div className="d-flex flex-wrap align-items-center gap-3 mb-3">
                <h2 id="reviews-title" className="h4 mb-0">Avis clients</h2>
                {data.average !== null && (
                    <span className="d-inline-flex align-items-center gap-2">
                        <Rating value={data.average} />
                        <span className="text-muted">{data.average}/5 · {data.count} avis</span>
                    </span>
                )}
            </div>

            {loading && <p>Chargement des avis…</p>}

            {loadError && !loading && (
                <div className="alert alert-warning" role="alert">{loadError}</div>
            )}

            {!loading && !loadError && data.items.length === 0 && (
                <p className="text-muted">Aucun avis pour le moment. Soyez le premier à en laisser un.</p>
            )}

            {!loading && data.items.length > 0 && (
                <ul className="list-group mb-4">
                    {data.items.map((review) => (
                        <li key={review._id} className="list-group-item">
                            <div className="d-flex justify-content-between align-items-center">
                                <strong>{review.authorName}</strong>
                                <Rating value={review.rating} />
                            </div>
                            <p className="mb-1 mt-2">{review.comment}</p>
                            <small className="text-muted">{formatDate(review.createdAt)}</small>
                            {review.reply?.message && (
                                <div className="mt-2 ps-3 border-start">
                                    <small className="fw-semibold">Réponse de l'artisan :</small>
                                    <p className="mb-0">{review.reply.message}</p>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}

            <h3 className="h5 mt-4">Laisser un avis</h3>
            <form className="review-form" onSubmit={handleSubmit} noValidate>
                <div className="row g-3">
                    <div className="col-md-6">
                        <label htmlFor="review-author" className="form-label">Votre nom *</label>
                        <input
                            id="review-author"
                            type="text"
                            className={`form-control ${errors.authorName ? 'is-invalid' : ''}`}
                            value={form.authorName}
                            onChange={update('authorName')}
                            required
                            minLength={2}
                            maxLength={120}
                            aria-describedby={errors.authorName ? 'err-author' : undefined}
                        />
                        {errors.authorName && <div id="err-author" className="invalid-feedback">{errors.authorName}</div>}
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="review-rating" className="form-label">Note *</label>
                        <select
                            id="review-rating"
                            className={`form-select ${errors.rating ? 'is-invalid' : ''}`}
                            value={form.rating}
                            onChange={update('rating')}
                            required
                        >
                            <option value="5">5 — Excellent</option>
                            <option value="4">4 — Très bien</option>
                            <option value="3">3 — Bien</option>
                            <option value="2">2 — Moyen</option>
                            <option value="1">1 — Décevant</option>
                        </select>
                        {errors.rating && <div className="invalid-feedback d-block">{errors.rating}</div>}
                    </div>

                    <div className="col-12">
                        <label htmlFor="review-comment" className="form-label">Votre avis *</label>
                        <textarea
                            id="review-comment"
                            rows="4"
                            className={`form-control ${errors.comment ? 'is-invalid' : ''}`}
                            value={form.comment}
                            onChange={update('comment')}
                            required
                            minLength={10}
                            maxLength={2000}
                            aria-describedby={errors.comment ? 'err-comment' : undefined}
                        />
                        {errors.comment && <div id="err-comment" className="invalid-feedback">{errors.comment}</div>}
                    </div>
                </div>

                {feedback && (
                    <div
                        className={`alert mt-3 ${feedbackOk ? 'alert-success' : 'alert-danger'}`}
                        role={feedbackOk ? 'status' : 'alert'}
                        aria-live="polite"
                    >
                        {feedback}
                    </div>
                )}

                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                    {submitting ? 'Envoi en cours…' : 'Publier mon avis'}
                </button>
            </form>
        </section>
    );
}
