/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { eq } from 'drizzle-orm';
import request from 'supertest';

import { ChapterEntity, CourseEntity } from '../db/schema';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('Chapter API Integration Tests', () => {
  const app = setupTestApp();

  let testCourseId: number;

  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(ChapterEntity);
    await db.delete(CourseEntity);

    // Create a test course for each test
    const [course] = await db
      .insert(CourseEntity)
      .values({ name: `Test Course ${randomString()}` })
      .returning();
    testCourseId = course.id;
  });

  describe('POST /api/chapters', () => {
    it('should create a new chapter', async () => {
      const chapterData = {
        name: `Test Chapter ${randomString()}`,
        order: 1,
        courseId: testCourseId,
      };

      const response = await request(app)
        .post('/api/chapters')
        .send(chapterData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        name: chapterData.name,
        order: chapterData.order,
        courseId: testCourseId,
      });

      // Verify chapter was actually created in the database
      const [createdChapter] = await db
        .select()
        .from(ChapterEntity)
        .where(eq(ChapterEntity.id, response.body.id));

      expect(createdChapter).toBeDefined();
      expect(createdChapter.name).toBe(chapterData.name);
      expect(createdChapter.order).toBe(chapterData.order);
      expect(createdChapter.courseId).toBe(testCourseId);
    });

    it('should validate chapter input', async () => {
      const invalidData = { name: '', order: -1, courseId: testCourseId };

      const response = await request(app)
        .post('/api/chapters')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'name should not be empty',
          'order must not be less than 1',
        ]),
      });

      // Verify no chapter was created in the database
      const dbChapters = await db.select().from(ChapterEntity);
      expect(dbChapters).toHaveLength(0);
    });

    it('should return 404 for non-existent course', async () => {
      const chapterData = {
        name: `Test Chapter ${randomString()}`,
        order: 1,
        courseId: 999,
      };

      const response = await request(app)
        .post('/api/chapters')
        .send(chapterData)
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });

      // Verify no chapter was created in the database
      const dbChapters = await db.select().from(ChapterEntity);
      expect(dbChapters).toHaveLength(0);
    });
  });

  describe('GET /api/chapters', () => {
    it('should return all chapters for a course', async () => {
      // Create test chapters
      const testChapters = [
        {
          name: `Chapter 1 ${randomString()}`,
          order: 1,
          courseId: testCourseId,
        },
        {
          name: `Chapter 2 ${randomString()}`,
          order: 2,
          courseId: testCourseId,
        },
        {
          name: `Chapter 3 ${randomString()}`,
          order: 3,
          courseId: testCourseId,
        },
      ];
      await db.insert(ChapterEntity).values(testChapters);

      const response = await request(app)
        .get(`/api/chapters?courseId=${testCourseId}`)
        .expect(200);

      expect(response.body.chapters).toHaveLength(testChapters.length);
      for (let i = 0; i < testChapters.length; i++) {
        expect(response.body.chapters[i]).toMatchObject({
          id: expect.any(Number),
          name: testChapters[i].name,
          order: testChapters[i].order,
          courseId: testCourseId,
        });
      }
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/chapters?courseId=999')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('GET /api/chapters/:chapterId', () => {
    it('should return a specific chapter', async () => {
      // Create a test chapter
      const [chapter] = await db
        .insert(ChapterEntity)
        .values({
          name: `Test Chapter ${randomString()}`,
          order: 1,
          courseId: testCourseId,
        })
        .returning();

      const response = await request(app)
        .get(`/api/chapters/${chapter.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: chapter.id,
        name: chapter.name,
        order: chapter.order,
        courseId: testCourseId,
      });
    });

    it('should return 404 for non-existent chapter', async () => {
      const response = await request(app).get('/api/chapters/999').expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/chapters/:chapterId', () => {
    it('should update a chapter', async () => {
      // Create a test chapter
      const [chapter] = await db
        .insert(ChapterEntity)
        .values({
          name: `Original Name ${randomString()}`,
          order: 1,
          courseId: testCourseId,
        })
        .returning();

      const updateData = {
        name: `Updated Name ${randomString()}`,
        order: 2,
        courseId: testCourseId,
      };

      const response = await request(app)
        .put(`/api/chapters/${chapter.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: chapter.id,
        name: updateData.name,
        order: updateData.order,
        courseId: testCourseId,
      });

      // Verify chapter was actually updated in the database
      const [updatedChapter] = await db
        .select()
        .from(ChapterEntity)
        .where(eq(ChapterEntity.id, chapter.id));

      expect(updatedChapter).toBeDefined();
      expect(updatedChapter.name).toBe(updateData.name);
      expect(updatedChapter.order).toBe(updateData.order);
      expect(updatedChapter.courseId).toBe(testCourseId);
    });

    it('should return 404 for updating non-existent chapter', async () => {
      const response = await request(app)
        .put('/api/chapters/999')
        .send({
          name: `New Name ${randomString()}`,
          order: 1,
          courseId: testCourseId,
        })
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });

  describe('DELETE /api/chapters/:chapterId', () => {
    it('should delete a chapter', async () => {
      // Create a test chapter
      const [chapter] = await db
        .insert(ChapterEntity)
        .values({
          name: `To Be Deleted ${randomString()}`,
          order: 1,
          courseId: testCourseId,
        })
        .returning();

      await request(app).delete(`/api/chapters/${chapter.id}`).expect(204);

      // Verify chapter was actually deleted from the database
      const [deletedChapter] = await db
        .select()
        .from(ChapterEntity)
        .where(eq(ChapterEntity.id, chapter.id));

      expect(deletedChapter).toBeUndefined();
    });

    it('should return 404 for deleting non-existent chapter', async () => {
      const response = await request(app)
        .delete('/api/chapters/999')
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });
    });
  });
});
