/**
 * Service d'envoi d'e-mails (formulaire de contact).
 * Utilise Nodemailer. Si la configuration SMTP est absente, l'envoi
 * est simulé (log uniquement) afin de ne pas bloquer le développement.
 */
const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    if (!env.smtp.host || !env.smtp.user) return null;

    transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.secure,
        auth: {
            user: env.smtp.user,
            pass: env.smtp.password,
        },
    });
    return transporter;
}

/**
 * Envoie un message de contact à un artisan.
 * @param {object} params
 * @param {object} params.artisan - Instance Sequelize Artisan
 * @param {string} params.senderName
 * @param {string} params.senderEmail
 * @param {string} params.subject
 * @param {string} params.message
 */
async function sendContactEmail({ artisan, senderName, senderEmail, subject, message }) {
    const t = getTransporter();
    const mail = {
        from: env.smtp.from || 'no-reply@trouvetonartisan.fr',
        to: artisan.email,
        replyTo: senderEmail,
        subject: `[Trouve ton artisan] ${subject}`,
        text:
            `Vous avez reçu un nouveau message via la plateforme Trouve ton artisan.\n\n` +
            `De   : ${senderName} <${senderEmail}>\n` +
            `Objet: ${subject}\n\n` +
            `${message}\n\n` +
            `--\nRépondez directement à cet e-mail pour contacter l'expéditeur.\n`,
    };

    if (!t) {
        // eslint-disable-next-line no-console
        console.log('[mailer] SMTP non configuré, simulation :', mail);
        return { simulated: true };
    }

    return t.sendMail(mail);
}

module.exports = { sendContactEmail };
