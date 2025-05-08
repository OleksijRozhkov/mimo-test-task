/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { eq } from 'drizzle-orm';
import request from 'supertest';

import { UserEntity } from '../db/schema';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('User API Integration Tests', () => {
  const app = setupTestApp();

  beforeEach(async () => {
    // Clear users table before each test
    await db.delete(UserEntity);
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const userData = { name: `Test User ${randomString()}` };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: userData.name,
      });

      // Verify user was actually created in the database
      const [createdUser] = await db
        .select()
        .from(UserEntity)
        .where(eq(UserEntity.id, response.body.id));

      expect(createdUser).toBeDefined();
      expect(createdUser.name).toBe(userData.name);
    });

    it('should validate user input', async () => {
      const invalidData = { name: '' };

      const response = await request(app)
        .post('/api/users')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining(['name should not be empty']),
      });
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Create test users
      const testUsers = [
        { name: `User 1 ${randomString()}` },
        { name: `User 2 ${randomString()}` },
        { name: `User 3 ${randomString()}` },
      ];
      await db.insert(UserEntity).values(testUsers);

      const response = await request(app).get('/api/users').expect(200);

      expect(response.body.users).toHaveLength(testUsers.length);
      for (let i = 0; i < testUsers.length; i++) {
        expect(response.body.users[i]).toMatchObject({
          id: expect.any(Number),
          name: testUsers[i].name,
        });
      }
    });
  });

  describe('GET /api/users/:userId', () => {
    it('should return a specific user', async () => {
      // Create a test user
      const [user] = await db
        .insert(UserEntity)
        .values({ name: `Test User ${randomString()}` })
        .returning();

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: user.id,
        name: user.name,
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app).get('/api/users/999').expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/users/:userId', () => {
    it('should update a user', async () => {
      // Create a test user
      const [user] = await db
        .insert(UserEntity)
        .values({ name: `Original Name ${randomString()}` })
        .returning();

      const updateData = { name: `Updated Name ${randomString()}` };

      await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData)
        .expect(200);

      // Verify user was actually updated in the database
      const [updatedUser] = await db
        .select()
        .from(UserEntity)
        .where(eq(UserEntity.id, user.id));

      expect(updatedUser).toBeDefined();
      expect(updatedUser.name).toBe(updateData.name);
    });

    it('should return 404 for updating non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/999')
        .send({ name: `New Name ${randomString()}` })
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('DELETE /api/users/:userId', () => {
    it('should delete a user', async () => {
      // Create a test user
      const [user] = await db
        .insert(UserEntity)
        .values({ name: `To Be Deleted ${randomString()}` })
        .returning();

      await request(app).delete(`/api/users/${user.id}`).expect(204);

      // Verify user was actually deleted from the database
      const [deletedUser] = await db
        .select()
        .from(UserEntity)
        .where(eq(UserEntity.id, user.id));

      expect(deletedUser).toBeUndefined();
    });

    it('should return 404 for deleting non-existent user', async () => {
      const response = await request(app).delete('/api/users/999').expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });
});
