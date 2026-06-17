/**
 * Modèle Mongoose : Review (avis client) — stockage NoSQL (document).
 * Ce stockage NoSQL est choisi pour ce cas d'usage car :
 *  - le schéma est souple et évolutif (ex. réponse de l'artisan imbriquée) ;
 *  - les avis sont lus par artisan, sans jointure ;
 *  - le volume peut croître fortement (append régulier).
 * Le lien avec l'artisan se fait via `artisanId` (clé de l'enregistrement
 * relationnel correspondant) : l'application combine ainsi SQL et NoSQL.
 */
const { mongoose } = require('../config/mongo');

const reviewSchema = new mongoose.Schema(
    {
        artisanId: {
            type: Number,
            required: true,
            index: true,
        },
        authorName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 120,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 10,
            maxlength: 2000,
        },
        // Réponse éventuelle de l'artisan : sous-document imbriqué (schéma souple).
        reply: {
            message: { type: String, trim: true, maxlength: 2000 },
            repliedAt: { type: Date },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
