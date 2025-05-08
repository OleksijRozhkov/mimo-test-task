/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { eq } from 'drizzle-orm';
import request from 'supertest';

import { LessonEntity, CourseEntity, ChapterEntity } from '../db/schema';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('Lesson API Integration Tests', () => {
  const app = setupTestApp();

  let testCourseId: number;
  let testChapterId: number;

  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(LessonEntity);
    await db.delete(ChapterEntity);
    await db.delete(CourseEntity);

    // Create a test course and chapter for each test
    const [course] = await db
      .insert(CourseEntity)
      .values({ name: `Test Course ${randomString()}` })
      .returning();
    testCourseId = course.id;

    const [chapter] = await db
      .insert(ChapterEntity)
      .values({
        name: `Test Chapter ${randomString()}`,
        order: 1,
        courseId: testCourseId,
      })
      .returning();
    testChapterId = chapter.id;
  });

  describe('POST /api/lessons', () => {
    it('should create a new lesson', async () => {
      const lessonData = {
        name: `Test Lesson ${randomString()}`,
        order: 1,
        chapterId: testChapterId,
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(lessonData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Lesson created successfully',
        lesson: {
          id: expect.any(Number),
          name: lessonData.name,
          order: lessonData.order,
          chapterId: testChapterId,
        },
      });

      // Verify lesson was actually created in the database
      const [createdLesson] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, response.body.lesson.id));

      expect(createdLesson).toBeDefined();
      expect(createdLesson.name).toBe(lessonData.name);
      expect(createdLesson.order).toBe(lessonData.order);
      expect(createdLesson.chapterId).toBe(testChapterId);
    });

    it('should validate lesson input', async () => {
      const invalidData = { name: '', order: -1, chapterId: testChapterId };

      const response = await request(app)
        .post('/api/lessons')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'name should not be empty',
          'order must not be less than 1',
        ]),
      });
    });

    it('should validate maximum name length', async () => {
      const invalidData = {
        name: 'a'.repeat(101),
        order: 1,
        chapterId: testChapterId,
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'name must be shorter than or equal to 100 characters',
        ]),
      });
    });

    it('should return 404 when creating lessonfor non-existent chapter', async () => {
      const lessonData = {
        name: `Test Lesson ${randomString()}`,
        order: 1,
        chapterId: 999,
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(lessonData)
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });

    it('should validate order sequence', async () => {
      // Try to create a lesson with order 2 when no lesson with order 1 exists
      const lessonData = {
        name: `Test Lesson ${randomString()}`,
        order: 2,
        chapterId: testChapterId,
      };

      const response = await request(app)
        .post('/api/lessons')
        .send(lessonData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('does not exist'),
      });
    });
  });

  describe('GET /api/lessons', () => {
    it('should return all lessons for a chapter', async () => {
      // Create test lessons
      const testLessons = [
        {
          name: `Lesson 1 ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        },
        {
          name: `Lesson 2 ${randomString()}`,
          order: 2,
          chapterId: testChapterId,
        },
        {
          name: `Lesson 3 ${randomString()}`,
          order: 3,
          chapterId: testChapterId,
        },
      ];
      await db.insert(LessonEntity).values(testLessons);

      const response = await request(app)
        .get(`/api/lessons?chapterId=${testChapterId}`)
        .expect(200);

      expect(response.body.lessons).toHaveLength(testLessons.length);
      for (let i = 0; i < testLessons.length; i++) {
        expect(response.body.lessons[i]).toMatchObject({
          id: expect.any(Number),
          name: testLessons[i].name,
          order: testLessons[i].order,
          chapterId: testChapterId,
        });
      }
    });

    it('should return empty array when no lessons exist', async () => {
      const response = await request(app)
        .get(`/api/lessons?chapterId=${testChapterId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        lessons: [],
      });
    });

    it('should return 404 for non-existent chapter', async () => {
      const response = await request(app)
        .get('/api/lessons?chapterId=999')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('GET /api/lessons/:lessonId', () => {
    it('should return a specific lesson', async () => {
      // Create a test lesson
      const [lesson] = await db
        .insert(LessonEntity)
        .values({
          name: `Test Lesson ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        })
        .returning();

      const response = await request(app)
        .get(`/api/lessons/${lesson.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        lesson: {
          id: lesson.id,
          name: lesson.name,
          order: lesson.order,
          chapterId: testChapterId,
        },
      });
    });

    it('should return 404 for non-existent lesson', async () => {
      const response = await request(app).get('/api/lessons/999').expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/lessons/:lessonId', () => {
    it('should update a lesson', async () => {
      // Create a test lesson
      const [lesson] = await db
        .insert(LessonEntity)
        .values({
          name: `Original Name ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        })
        .returning();

      const updateData = {
        name: `Updated Name ${randomString()}`,
        order: 1,
      };

      const response = await request(app)
        .put(`/api/lessons/${lesson.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        message: 'Lesson updated successfully',
        lesson: {
          id: lesson.id,
          name: updateData.name,
          order: updateData.order,
          chapterId: testChapterId,
        },
      });

      // Verify lesson was actually updated in the database
      const [updatedLesson] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson.id));

      expect(updatedLesson).toBeDefined();
      expect(updatedLesson.name).toBe(updateData.name);
      expect(updatedLesson.order).toBe(updateData.order);
    });

    it('should return 404 for updating non-existent lesson', async () => {
      const response = await request(app)
        .put('/api/lessons/999')
        .send({
          name: `New Name ${randomString()}`,
          order: 1,
        })
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });

    it('should validate order sequence when moving up', async () => {
      // Create two lessons
      const [lesson1] = await db
        .insert(LessonEntity)
        .values({
          name: `Lesson 1 ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        })
        .returning();

      const [lesson2] = await db
        .insert(LessonEntity)
        .values({
          name: `Lesson 2 ${randomString()}`,
          order: 2,
          chapterId: testChapterId,
        })
        .returning();

      // Try to move lesson2 to order 1
      await request(app)
        .put(`/api/lessons/${lesson2.id}`)
        .send({ order: 1 })
        .expect(200);

      // Verify the order was updated correctly
      const [updatedLesson1] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson1.id));
      const [updatedLesson2] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson2.id));

      expect(updatedLesson1.order).toBe(2);
      expect(updatedLesson2.order).toBe(1);
    });
  });

  describe('DELETE /api/lessons/:lessonId', () => {
    it('should delete a lesson', async () => {
      // Create a test lesson
      const [lesson] = await db
        .insert(LessonEntity)
        .values({
          name: `To Be Deleted ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        })
        .returning();

      await request(app).delete(`/api/lessons/${lesson.id}`).expect(204);

      // Verify lesson was actually deleted from the database
      const [deletedLesson] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson.id));

      expect(deletedLesson).toBeUndefined();
    });

    it('should return 404 for deleting non-existent lesson', async () => {
      const response = await request(app)
        .delete('/api/lessons/999')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });

    it('should update order of remaining lessons after deletion', async () => {
      // Create three lessons
      const [lesson1] = await db
        .insert(LessonEntity)
        .values({
          name: `Lesson 1 ${randomString()}`,
          order: 1,
          chapterId: testChapterId,
        })
        .returning();

      const [lesson2] = await db
        .insert(LessonEntity)
        .values({
          name: `Lesson 2 ${randomString()}`,
          order: 2,
          chapterId: testChapterId,
        })
        .returning();

      const [lesson3] = await db
        .insert(LessonEntity)
        .values({
          name: `Lesson 3 ${randomString()}`,
          order: 3,
          chapterId: testChapterId,
        })
        .returning();

      // Delete lesson2
      await request(app).delete(`/api/lessons/${lesson2.id}`).expect(204);

      // Verify remaining lessons have correct order
      const [updatedLesson1] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson1.id));
      const [updatedLesson3] = await db
        .select()
        .from(LessonEntity)
        .where(eq(LessonEntity.id, lesson3.id));

      expect(updatedLesson1.order).toBe(1);
      expect(updatedLesson3.order).toBe(2);
    });
  });
});
