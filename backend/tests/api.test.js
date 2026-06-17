/**
 * Tests automatisés de l'API Trouve ton artisan.
 *  - SQL : artisans / catégories (SQLite en mémoire via Sequelize).
 *  - NoSQL : avis clients (MongoDB éphémère via mongodb-memory-server).
 *  - Sécurité : clé d'API, validation des entrées.
 * Exécution isolée : aucune base de données réelle n'est touchée.
 */
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const API_KEY = 'cle-de-test-tres-longue-pour-les-tests-123456';

let app;
let models;
let connectMongo;
let disconnectMongo;
let mongo;
let artisanId;

beforeAll(async () => {
    // 1. MongoDB éphémère
    mongo = await MongoMemoryServer.create();

    // 2. Variables d'environnement AVANT le require des modules de config
    process.env.NODE_ENV = 'test';
    process.env.DB_HOST = 'localhost';
    process.env.DB_NAME = 'test';
    process.env.DB_USER = 'test';
    process.env.DB_PASSWORD = 'test';
    process.env.API_KEY = API_KEY;
    process.env.CORS_ORIGIN = 'http://localhost:5173';
    process.env.MONGODB_URI = mongo.getUri('trouve_ton_artisan_test');

    // 3. Require après configuration de l'environnement
    app = require('../src/app');
    models = require('../src/models');
    ({ connectMongo, disconnectMongo } = require('../src/config/mongo'));

    // 4. Schéma SQL (SQLite en mémoire) + jeu d'essai minimal
    await models.sequelize.sync({ force: true });
    const category = await models.Category.create({ name: 'Bâtiment' });
    const specialty = await models.Specialty.create({ name: 'Plomberie', categoryId: category.id });
    const city = await models.City.create({ name: 'Lyon' });
    const artisan = await models.Artisan.create({
        name: 'Plomberie Dupont',
        rating: 4.5,
        cityId: city.id,
        email: 'contact@plomberie-dupont.fr',
        specialtyId: specialty.id,
        isTopOfMonth: true,
    });
    artisanId = artisan.id;

    // 5. Connexion NoSQL
    await connectMongo();
});

afterAll(async () => {
    if (disconnectMongo) await disconnectMongo();
    if (models && models.sequelize) await models.sequelize.close();
    if (mongo) await mongo.stop();
});

describe('API Artisans (SQL)', () => {
    test('GET /api/artisans retourne la liste (avec clé API)', async () => {
        const res = await request(app).get('/api/artisans').set('x-api-key', API_KEY);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toHaveProperty('name', 'Plomberie Dupont');
        expect(res.body[0].city).toHaveProperty('name', 'Lyon');
    });

    test('GET /api/artisans/:id retourne la fiche', async () => {
        const res = await request(app).get(`/api/artisans/${artisanId}`).set('x-api-key', API_KEY);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', artisanId);
        expect(res.body.specialty).toHaveProperty('name', 'Plomberie');
    });

    test('GET /api/artisans/:id inexistant => 404', async () => {
        const res = await request(app).get('/api/artisans/99999').set('x-api-key', API_KEY);
        expect(res.status).toBe(404);
    });

    test('GET /api/artisans?q=… sans résultat => 200 + tableau vide', async () => {
        const res = await request(app)
            .get('/api/artisans?q=zzz-aucun-resultat')
            .set('x-api-key', API_KEY);
        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

describe('API Avis (NoSQL)', () => {
    test('GET /api/artisans/:id/reviews est vide au départ', async () => {
        const res = await request(app)
            .get(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ items: [], count: 0, average: null });
    });

    test('POST un avis valide => 201, puis lecture + moyenne', async () => {
        const r1 = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Claire', rating: 5, comment: 'Travail impeccable et très soigné.' });
        expect(r1.status).toBe(201);
        expect(r1.body).toHaveProperty('success', true);

        const r2 = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Marc', rating: 3, comment: 'Correct, mais un peu en retard.' });
        expect(r2.status).toBe(201);

        const list = await request(app)
            .get(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY);
        expect(list.status).toBe(200);
        expect(list.body.count).toBe(2);
        expect(list.body.average).toBe(4); // (5 + 3) / 2
        expect(list.body.items[0]).toHaveProperty('authorName');
    });

    test('POST un avis sur un artisan inexistant => 404', async () => {
        const res = await request(app)
            .post('/api/artisans/99999/reviews')
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Test', rating: 4, comment: 'Un commentaire suffisamment long.' });
        expect(res.status).toBe(404);
    });
});

describe('Sécurité', () => {
    test('sans clé API => 401', async () => {
        const res = await request(app).get('/api/artisans');
        expect(res.status).toBe(401);
    });

    test('mauvaise clé API => 401', async () => {
        const res = await request(app).get('/api/artisans').set('x-api-key', 'mauvaise-cle');
        expect(res.status).toBe(401);
    });

    test('avis invalide (note hors bornes + commentaire trop court) => 400', async () => {
        const res = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'X', rating: 9, comment: 'court' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error', 'ValidationError');
    });

    test('GET /api/health est public => 200', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });
});
