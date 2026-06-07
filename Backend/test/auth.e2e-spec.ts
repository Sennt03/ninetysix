import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Recorre el flujo completo de la base contra una MongoDB en memoria
 * (sin necesidad de infraestructura externa).
 */
describe('Auth & Users (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let accessToken: string;
  let refreshToken: string;

  const credentials = {
    email: 'tester@example.com',
    username: 'tester',
    password: 'Sup3rSecret!',
  };

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await mongod?.stop();
  });

  it('registra un usuario y devuelve tokens (sin exponer password)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(credentials)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(credentials.email);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.tokens.accessToken).toBeDefined();

    accessToken = res.body.data.tokens.accessToken;
    refreshToken = res.body.data.tokens.refreshToken;
  });

  it('rechaza un email duplicado (409)', () =>
    request(app.getHttpServer()).post('/auth/register').send(credentials).expect(409));

  it('rechaza propiedades desconocidas en el body (400)', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ ...credentials, hacker: true })
      .expect(400));

  it('inicia sesión correctamente (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credentials.email, password: credentials.password })
      .expect(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('rechaza credenciales inválidas (401)', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: credentials.email, password: 'incorrecta' })
      .expect(401));

  it('bloquea rutas protegidas sin token (401)', () =>
    request(app.getHttpServer()).get('/users/me').expect(401));

  it('devuelve el perfil con un token válido (200)', async () => {
    const res = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.data.email).toBe(credentials.email);
    expect(res.body.data.roles).toContain('USER');
  });

  it('prohíbe a un usuario normal listar usuarios (403)', () =>
    request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403));

  it('renueva los tokens con el refresh token (200)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Authorization', `Bearer ${refreshToken}`)
      .expect(200);
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('expone un healthcheck público (200)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.database).toBe('mongodb');
  });
});
