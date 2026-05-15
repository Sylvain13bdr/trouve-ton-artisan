/**
 * Point d'entrée du serveur API.
 * Teste la connexion à la base de données puis démarre Express.
 */
const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');

async function bootstrap() {
    try {
        await sequelize.authenticate();
        // eslint-disable-next-line no-console
        console.log('[db] Connexion à MySQL/MariaDB OK.');

        app.listen(env.port, () => {
            // eslint-disable-next-line no-console
            console.log(`[api] Trouve ton artisan API en écoute sur le port ${env.port} (${env.nodeEnv}).`);
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[bootstrap] Démarrage impossible :', err);
        process.exit(1);
    }
}

bootstrap();
