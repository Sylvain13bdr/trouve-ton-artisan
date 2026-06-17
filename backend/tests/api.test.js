/**
 * Tests automatisés de l'API Trouve ton artisan (Mocha + Chai + Supertest).
 *  - SQL : artisans / catégories (SQLite en mémoire via Sequelize).
 *  - NoSQL : avis clients (MongoDB éphémère via mongodb-memory-server).
 *  - Sécurité : clé d'API, validation des entrées.
 * Exécution isolée : aucune base de données réelle n'est touchée.
 */
const { expect } = require('chai');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const API_KEY = 'cle-de-test-tres-longue-pour-les-tests-123456';

let app;
let models;
let connectMongo;
let disconnectMongo;
let mongo;
let artisanId;

before(async function () {
    this.timeout(60000);

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

after(async function () {
    if (disconnectMongo) await disconnectMongo();
    if (models && models.sequelize) await models.sequelize.close();
    if (mongo) await mongo.stop();
});

describe('API Artisans (SQL)', function () {
    it('GET /api/artisans retourne la liste (avec clé API)', async function () {
        const res = await request(app).get('/api/artisans').set('x-api-key', API_KEY);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array').with.lengthOf(1);
        expect(res.body[0]).to.have.property('name', 'Plomberie Dupont');
        expect(res.body[0].city).to.have.property('name', 'Lyon');
    });

    it('GET /api/artisans/:id retourne la fiche', async function () {
        const res = await request(app).get(`/api/artisans/${artisanId}`).set('x-api-key', API_KEY);
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('id', artisanId);
        expect(res.body.specialty).to.have.property('name', 'Plomberie');
    });

    it('GET /api/artisans/:id inexistant => 404', async function () {
        const res = await request(app).get('/api/artisans/99999').set('x-api-key', API_KEY);
        expect(res.status).to.equal(404);
    });

    it('GET /api/artisans?q=… sans résultat => 200 + tableau vide', async function () {
        const res = await request(app).get('/api/artisans?q=zzz-aucun-resultat').set('x-api-key', API_KEY);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal([]);
    });
});

describe('API Avis (NoSQL)', function () {
    it('GET /api/artisans/:id/reviews est vide au départ', async function () {
        const res = await request(app).get(`/api/artisans/${artisanId}/reviews`).set('x-api-key', API_KEY);
        expect(res.status).to.equal(200);
        expect(res.body).to.deep.equal({ items: [], count: 0, average: null });
    });

    it('POST un avis valide => 201, puis lecture + moyenne', async function () {
        const r1 = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Claire', rating: 5, comment: 'Travail impeccable et très soigné.' });
        expect(r1.status).to.equal(201);
        expect(r1.body).to.have.property('success', true);

        const r2 = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Marc', rating: 3, comment: 'Correct, mais un peu en retard.' });
        expect(r2.status).to.equal(201);

        const list = await request(app).get(`/api/artisans/${artisanId}/reviews`).set('x-api-key', API_KEY);
        expect(list.status).to.equal(200);
        expect(list.body.count).to.equal(2);
        expect(list.body.average).to.equal(4); // (5 + 3) / 2
        expect(list.body.items[0]).to.have.property('authorName');
    });

    it('POST un avis sur un artisan inexistant => 404', async function () {
        const res = await request(app)
            .post('/api/artisans/99999/reviews')
            .set('x-api-key', API_KEY)
            .send({ authorName: 'Test', rating: 4, comment: 'Un commentaire suffisamment long.' });
        expect(res.status).to.equal(404);
    });
});

describe('Sécurité', function () {
    it('sans clé API => 401', async function () {
        const res = await request(app).get('/api/artisans');
        expect(res.status).to.equal(401);
    });

    it('mauvaise clé API => 401', async function () {
        const res = await request(app).get('/api/artisans').set('x-api-key', 'mauvaise-cle');
        expect(res.status).to.equal(401);
    });

    it('avis invalide (note hors bornes + commentaire trop court) => 400', async function () {
        const res = await request(app)
            .post(`/api/artisans/${artisanId}/reviews`)
            .set('x-api-key', API_KEY)
            .send({ authorName: 'X', rating: 9, comment: 'court' });
        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error', 'ValidationError');
    });

    it('GET /api/health est public => 200', async function () {
        const res = await request(app).get('/api/health');
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('status', 'ok');
    });
});
