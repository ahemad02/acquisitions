import app from '#src/app.js';
import request from 'supertest';

describe('API Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('GET /api', () => {
    it('should return api message', async () => {
      const response = await request(app).get('/api');

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty(
        'message',
        'Hello from Acquisitions API!'
      );
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for nonexistent endpoint', async () => {
      const response = await request(app).get('/nonexistent');

      expect(response.status).toBe(404);

      expect(response.body).toHaveProperty('error', 'Route not found');
    });
  });
});
