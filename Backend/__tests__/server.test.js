const request = require('supertest');
const app = require('../server'); // make sure your server exports the Express app

describe('Basic server tests', () => {
  it('should return 200 on root path', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  it('should have JSON response for /login POST', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'test', password: 'test' });
    expect(res.statusCode).toBe(200); // adjust according to your logic
    expect(res.body).toHaveProperty('success');
  });
});
