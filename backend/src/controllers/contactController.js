/**
 * Contrôleur : formulaire de contact.
 * Reçoit nom + email + objet + message, délègue au service qui enregistre
 * la trace en BDD et déclenche l'e-mail.
 */
const contactService = require('../services/contactService');

async function postContact(req, res, next) {
    try {
        const artisanId = Number(req.params.id);
        const { name, email, subject, message } = req.body;

        const result = await contactService.sendContactMessage(artisanId, {
            name,
            email,
            subject,
            message,
        });

        if (result.notFound) {
            return res.status(404).json({ error: 'NotFound', message: 'Artisan introuvable.' });
        }

        return res.status(201).json({
            id: result.id,
            success: true,
            message: 'Votre message a bien été transmis. Une réponse vous sera apportée sous 48h.',
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = { postContact };
