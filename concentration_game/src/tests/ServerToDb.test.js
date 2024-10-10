const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../../server/server');
const db = require('../../server/db');
const User = require('../../server/models/User');

describe('Server and Database Integration Tests', () => {
  let testUsername = 'testuser777';
  let testPassword = 'password123';

  beforeAll(async () => {
    try {
      await db.connect();
    } catch (error) {
      console.error('Failed to connect to the database:', error);
    }
  });

  it('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth')
      .send({ username: testUsername, password: testPassword });

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe('User registered successfully');
  });

  it('should allow the user to log in after logging out', async () => {
    const loginResponse = await request(app)
      .post('/api/auth')
      .send({ username: testUsername, password: testPassword });

    expect(loginResponse.statusCode).toBe(200);
    expect(loginResponse.body.message).toBe('Login successful');

    const logoutResponse = await request(app)
      .post('/api/logout');
    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.body.message).toBe('Logout successful (no session)');
  });

  afterAll(async () => {
    await User.deleteOne({ username: testUsername });
    await mongoose.disconnect();
    server.close();
  });
});
