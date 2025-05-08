/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { eq } from 'drizzle-orm';
import request from 'supertest';

import { CourseEntity } from '../db/schema';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('Course API Integration Tests', () => {
  const app = setupTestApp();

  beforeEach(async () => {
    // Clear courses table before each test
    await db.delete(CourseEntity);
  });

  describe('POST /api/courses', () => {
    it('should create a new course', async () => {
      const courseData = { name: `Test Course ${randomString()}` };

      const response = await request(app)
        .post('/api/courses')
        .send(courseData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: courseData.name,
      });

      // Verify course was actually created in the database
      const [createdCourse] = await db
        .select()
        .from(CourseEntity)
        .where(eq(CourseEntity.id, response.body.id));

      expect(createdCourse).toBeDefined();
      expect(createdCourse.name).toBe(courseData.name);
    });

    it('should validate course input', async () => {
      const invalidData = { name: '' };

      const response = await request(app)
        .post('/api/courses')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining(['name should not be empty']),
      });
    });

    it('should validate maximum name length', async () => {
      const invalidData = { name: 'a'.repeat(101) };

      const response = await request(app)
        .post('/api/courses')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'name must be shorter than or equal to 100 characters',
        ]),
      });
    });

    it('should validate name is a string', async () => {
      const invalidData = { name: 123 };

      const response = await request(app)
        .post('/api/courses')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining(['name must be a string']),
      });
    });
  });

  describe('GET /api/courses', () => {
    it('should return all courses', async () => {
      // Create test courses
      const testCourses = [
        { name: `Course 1 ${randomString()}` },
        { name: `Course 2 ${randomString()}` },
        { name: `Course 3 ${randomString()}` },
      ];
      await db.insert(CourseEntity).values(testCourses);

      const response = await request(app).get('/api/courses').expect(200);

      expect(response.body.courses).toHaveLength(testCourses.length);
      for (let i = 0; i < testCourses.length; i++) {
        expect(response.body.courses[i]).toMatchObject({
          id: expect.any(Number),
          name: testCourses[i].name,
        });
      }
    });

    it('should return empty array when no courses exist', async () => {
      const response = await request(app).get('/api/courses').expect(200);

      expect(response.body).toMatchObject({
        courses: [],
      });
    });
  });

  describe('GET /api/courses/:courseId', () => {
    it('should return a specific course', async () => {
      // Create a test course
      const [course] = await db
        .insert(CourseEntity)
        .values({ name: `Test Course ${randomString()}` })
        .returning();

      const response = await request(app)
        .get(`/api/courses/${course.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: course.id,
        name: course.name,
      });
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app).get('/api/courses/999').expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/courses/:courseId', () => {
    it('should update a course', async () => {
      // Create a test course
      const [course] = await db
        .insert(CourseEntity)
        .values({ name: `Original Name ${randomString()}` })
        .returning();

      const updateData = { name: `Updated Name ${randomString()}` };

      await request(app)
        .put(`/api/courses/${course.id}`)
        .send(updateData)
        .expect(200);

      // Verify course was actually updated in the database
      const [updatedCourse] = await db
        .select()
        .from(CourseEntity)
        .where(eq(CourseEntity.id, course.id));

      expect(updatedCourse).toBeDefined();
      expect(updatedCourse.name).toBe(updateData.name);
    });

    it('should return 404 for updating non-existent course', async () => {
      const response = await request(app)
        .put('/api/courses/999')
        .send({ name: `New Name ${randomString()}` })
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });

    it('should allow updating with the same name', async () => {
      // Create a test course
      const [course] = await db
        .insert(CourseEntity)
        .values({ name: `Original Name ${randomString()}` })
        .returning();

      const updateData = { name: course.name };

      const response = await request(app)
        .put(`/api/courses/${course.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: course.id,
        name: course.name,
      });
    });
  });

  describe('DELETE /api/courses/:courseId', () => {
    it('should delete a course', async () => {
      // Create a test course
      const [course] = await db
        .insert(CourseEntity)
        .values({ name: `To Be Deleted ${randomString()}` })
        .returning();

      await request(app).delete(`/api/courses/${course.id}`).expect(204);

      // Verify course was actually deleted from the database
      const [deletedCourse] = await db
        .select()
        .from(CourseEntity)
        .where(eq(CourseEntity.id, course.id));

      expect(deletedCourse).toBeUndefined();
    });

    it('should return 404 for deleting non-existent course', async () => {
      const response = await request(app)
        .delete('/api/courses/999')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });
});
