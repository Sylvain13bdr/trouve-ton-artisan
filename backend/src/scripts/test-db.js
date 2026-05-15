/**
 * Petit utilitaire pour vérifier la connexion à la BDD
 * et afficher quelques compteurs (utile au démarrage / déploiement).
 *
 * Exécution : `npm run db:test`
 */
const { sequelize, Category, Specialty, Artisan } = require('../models');

(async () => {
    try {
        await sequelize.authenticate();
        const [categories, specialties, artisans] = await Promise.all([
            Category.count(),
            Specialty.count(),
            Artisan.count(),
        ]);
        // eslint-disable-next-line no-console
        console.log({ categories, specialties, artisans });
        process.exit(0);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[test-db] Échec :', err.message);
        process.exit(1);
    }
})();
