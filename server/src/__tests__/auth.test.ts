import request from 'supertest';
import app from '../app';
import { prisma } from '../utils/prisma';

describe('StoreHub Authentication API Tests', () => {
  const testUser = {
    name: 'Test Registration User Account Name',
    email: 'testauthuser@storehub.com',
    password: 'Password123!',
    address: '100 Test Avenue, Suite 200, Sample City, ST 12345',
  };

  afterAll(async () => {
    // Clean up test user
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    await prisma.$disconnect();
  });

  it('should register a new user successfully with valid inputs', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toHaveProperty('id');
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject registration with weak password (missing uppercase/special char)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Weak Password Test User Account Name',
      email: 'weakpass@storehub.com',
      password: 'simplepassword',
      address: '100 Test Avenue, Suite 200, Sample City, ST 12345',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should reject registration with name under 20 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Short Name',
      email: 'shortname@storehub.com',
      password: 'Password123!',
      address: '100 Test Avenue, Suite 200, Sample City, ST 12345',
    });

    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('should login existing user with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'WrongPassword123!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
