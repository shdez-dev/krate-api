import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { DataSource } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;

  const user = {
    email: 'e2e@krate.dev',
    password: 'Test1234!',
    firstName: 'E2E',
    lastName: 'Test',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );

    await app.init();
    dataSource = moduleFixture.get(DataSource);
  });

  afterAll(async () => {
    await dataSource.query(`DELETE FROM users WHERE email = '${user.email}'`);
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('registra un nuevo usuario y retorna tokens', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('lanza 409 si el email ya existe', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(409);
    });

    it('lanza 400 si faltan campos requeridos', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'incomplete@krate.dev' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('retorna tokens con credenciales válidas', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      accessToken = res.body.accessToken;
    });

    it('lanza 401 con contraseña incorrecta', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: 'WrongPass999!' })
        .expect(401);
    });

    it('lanza 401 si el usuario no existe', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@krate.dev', password: 'Test1234!' })
        .expect(401);
    });
  });

  describe('GET /users/me', () => {
    it('retorna el perfil del usuario autenticado', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(user.email);
    });

    it('lanza 401 sin token', async () => {
      await request(app.getHttpServer())
        .get('/users/me')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('cierra la sesión correctamente', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
