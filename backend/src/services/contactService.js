/**
 * Service : envoi d'un message de contact à un artisan.
 * Enregistre la trace en BDD puis déclenche l'e-mail.
 */
const { Artisan, ContactMessage } = require('../models');
const mailer = require('./mailer');

async function sendContactMessage(artisanId, { name, email, subject, message }) {
    const artisan = await Artisan.findByPk(artisanId);
    if (!artisan) return { notFound: true };

    const stored = await ContactMessage.create({
        artisanId,
        senderName: name,
        senderEmail: email,
        subject,
        message,
    });

    await mailer.sendContactEmail({
        artisan,
        senderName: name,
        senderEmail: email,
        subject,
        message,
    });

    return { id: stored.id };
}

module.exports = { sendContactMessage };
