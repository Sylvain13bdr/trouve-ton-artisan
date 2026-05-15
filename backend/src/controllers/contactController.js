/**
 * Contrôleur : formulaire de contact.
 * Reçoit nom + email + objet + message, enregistre la trace en BDD
 * et tente l'envoi d'un e-mail à l'artisan.
 */
const { Artisan, ContactMessage } = require('../models');
const mailer = require('../services/mailer');

async function postContact(req, res, next) {
    try {
        const artisanId = Number(req.params.id);
        const artisan = await Artisan.findByPk(artisanId);
        if (!artisan) {
            return res.status(404).json({ error: 'NotFound', message: 'Artisan introuvable.' });
        }

        const { name, email, subject, message } = req.body;

        // Enregistrement systématique en BDD (audit / éventuelles relances)
        const created = await ContactMessage.create({
            artisanId,
            senderName: name,
            senderEmail: email,
            subject,
            message,
        });

        // Envoi de l'e-mail (peut être simulé si SMTP non configuré)
        await mailer.sendContactEmail({
            artisan,
            senderName: name,
            senderEmail: email,
            subject,
            message,
        });

        return res.status(201).json({
            id: created.id,
            success: true,
            message: 'Votre message a bien été transmis. Une réponse vous sera apportée sous 48h.',
        });
    } catch (err) {
        return next(err);
    }
}

module.exports = { postContact };
