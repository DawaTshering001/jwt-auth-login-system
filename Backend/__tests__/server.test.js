const request = require('supertest');
const app = require('../server');

describe('Basic server tests', () => {
  it('should return 200 on root path', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });
});
