/**
 * Client HTTP léger vers l'API Trouve ton artisan.
 * Injecte automatiquement la clé d'API et centralise la gestion d'erreurs.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const API_KEY = import.meta.env.VITE_API_KEY || '';

async function request(path, options = {}) {
    const url = `${API_URL}${path}`;

    const headers = {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...(options.headers || {}),
    };

    let response;
    try {
        response = await fetch(url, { ...options, headers });
    } catch (networkError) {
        throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion.');
    }

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json().catch(() => null) : null;

    if (!response.ok) {
        const message =
            payload?.message ||
            payload?.error ||
            `Erreur ${response.status} lors de l'appel à ${path}.`;
        const error = new Error(message);
        error.status = response.status;
        error.details = payload?.details;
        throw error;
    }

    return payload;
}

export const api = {
    getCategories: () => request('/categories'),
    getArtisans: ({ category, q } = {}) => {
        const params = new URLSearchParams();
        if (category) params.set('category', category);
        if (q) params.set('q', q);
        const qs = params.toString();
        return request(`/artisans${qs ? `?${qs}` : ''}`);
    },
    getArtisan: (id) => request(`/artisans/${id}`),
    getTopOfMonth: () => request('/artisans/top-of-month'),
    postContact: (id, data) =>
        request(`/artisans/${id}/contact`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};
