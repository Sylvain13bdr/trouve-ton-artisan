/**
 * Affiche une note sur 5 sous forme d'étoiles (pleines / demi / vides).
 * Accessible : la valeur est aussi exposée en texte pour les lecteurs d'écran.
 */
export default function Rating({ value }) {
    const safe = Math.max(0, Math.min(5, Number(value) || 0));
    const full = Math.floor(safe);
    const half = safe - full >= 0.25 && safe - full < 0.75;
    const total = 5;

    const stars = [];
    for (let i = 0; i < total; i += 1) {
        if (i < full) stars.push('bi-star-fill');
        else if (i === full && half) stars.push('bi-star-half');
        else stars.push('bi-star');
    }

    return (
        <span
            className="rating"
            aria-label={`Note de ${safe.toFixed(1)} sur 5`}
            role="img"
        >
            {stars.map((cls, idx) => (
                <i key={idx} className={`bi ${cls}`} aria-hidden="true" />
            ))}
            <span className="rating__value" aria-hidden="true">
                {safe.toFixed(1)}/5
            </span>
        </span>
    );
}
