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

  it('should update the score for a user', async () => {
    const scoreUpdateResponse = await request(app)
      .post('/api/game/update-score')
      .send({
        username: testUsername,
        level: 1,
        correctTilesSelected: 5,
        totalTiles: 10
      });

    expect(scoreUpdateResponse.statusCode).toBe(200);
    expect(scoreUpdateResponse.body.message).toBe('Score updated successfully');
    expect(scoreUpdateResponse.body.user.levels[0].correctTilesSelected).toBe(5);
    expect(scoreUpdateResponse.body.user.tilesNow).toBe(0);
  });

  it('should reset tilesNow and update maxScore correctly', async () => {
    const resetTilesResponse = await request(app)
      .post('/api/game/reset-tiles-now')
      .send({ username: testUsername });

    expect(resetTilesResponse.statusCode).toBe(200);
    expect(resetTilesResponse.body.message).toBe('TilesNow reset successfully');

    const user = await User.findOne({ username: testUsername });
    const totalScore = user.levels.reduce((sum, levelData) => sum + levelData.correctTilesSelected, 0);
    expect(user.tilesNow).toBe(0);
    expect(user.maxScore).toBe(totalScore);
  });

  it('should update tilesNow for a user', async () => {
    const updateTilesResponse = await request(app)
      .post('/api/game/update-tiles-now')
      .send({ username: testUsername, tilesNow: 7 });

    expect(updateTilesResponse.statusCode).toBe(200);
    expect(updateTilesResponse.body.message).toBe('TilesNow updated successfully');

    const user = await User.findOne({ username: testUsername });
    expect(user.tilesNow).toBe(7);
  });

  it('should return the leaderboard sorted by maxScore', async () => {
    const leaderboardResponse = await request(app).get('/api/game/leaderboard');

    expect(leaderboardResponse.statusCode).toBe(200);
    expect(Array.isArray(leaderboardResponse.body)).toBe(true);

    const leaderboard = leaderboardResponse.body;
    for (let i = 1; i < leaderboard.length; i++) {
      expect(leaderboard[i - 1].maxScore).toBeGreaterThanOrEqual(leaderboard[i].maxScore);
    }
  });

  afterAll(async () => {
    await User.deleteOne({ username: testUsername });
    await mongoose.disconnect();
    server.close();
  });
});
