/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { eq, and } from 'drizzle-orm';
import request from 'supertest';

import {
  LessonProgressEntity,
  LessonEntity,
  ChapterEntity,
  CourseEntity,
  UserEntity,
  AchievementEntity,
  ObjectiveType,
} from '../db/schema';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('Lesson Progress API Integration Tests', () => {
  const app = setupTestApp();

  let testCourseId: number;
  let testChapterId: number;
  let testLessonId: number;
  let testUserId: number;

  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(LessonProgressEntity);
    await db.delete(LessonEntity);
    await db.delete(ChapterEntity);
    await db.delete(CourseEntity);
    await db.delete(UserEntity);

    // Create a test user
    const [user] = await db
      .insert(UserEntity)
      .values({
        name: `Test User ${randomString()}`,
      })
      .returning();
    testUserId = user.id;

    // Create a test course, chapter, and lesson for each test
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

    const [lesson] = await db
      .insert(LessonEntity)
      .values({
        name: `Test Lesson ${randomString()}`,
        order: 1,
        chapterId: testChapterId,
      })
      .returning();
    testLessonId = lesson.id;
  });

  describe('POST /api/lesson-progress', () => {
    it('should record lesson progress', async () => {
      const now = new Date();
      const progressData = {
        lessonId: testLessonId,
        startedAt: now.toISOString(),
        completedAt: new Date(now.getTime() + 300000).toISOString(), // 5 minutes later
        userId: testUserId,
      };

      const response = await request(app)
        .post('/api/lesson-progress')
        .send(progressData)
        .expect(201);

      expect(response.body).toMatchObject({
        message: 'Lesson progress recorded successfully',
        progress: {
          id: expect.any(Number),
          lessonId: progressData.lessonId,
          userId: testUserId,
          startedAt: expect.any(String),
          completedAt: expect.any(String),
        },
      });

      // Verify progress was actually recorded in the database
      const [recordedProgress] = await db
        .select()
        .from(LessonProgressEntity)
        .where(eq(LessonProgressEntity.lessonId, testLessonId));

      expect(recordedProgress).toBeDefined();
      expect(recordedProgress.lessonId).toBe(progressData.lessonId);
      expect(recordedProgress.userId).toBe(testUserId);
      expect(recordedProgress.completed).toBe(true);
      expect(recordedProgress.completedAt).toBeDefined();
    });

    it('should handle multiple attempts at the same lesson', async () => {
      // First attempt
      const firstAttempt = new Date();
      const firstAttemptData = {
        lessonId: testLessonId,
        startedAt: firstAttempt.toISOString(),
        completedAt: new Date(firstAttempt.getTime() + 300000).toISOString(), // 5 minutes later
        userId: testUserId,
      };

      await request(app)
        .post('/api/lesson-progress')
        .send(firstAttemptData)
        .expect(201);

      // Second attempt
      const secondAttempt = new Date();
      const secondAttemptData = {
        lessonId: testLessonId,
        startedAt: secondAttempt.toISOString(),
        completedAt: new Date(secondAttempt.getTime() + 200000).toISOString(), // 3.33 minutes later
        userId: testUserId,
      };

      await request(app)
        .post('/api/lesson-progress')
        .send(secondAttemptData)
        .expect(201);

      // Verify both progress records were saved
      const progressRecords = await db
        .select()
        .from(LessonProgressEntity)
        .where(
          and(
            eq(LessonProgressEntity.lessonId, testLessonId),
            eq(LessonProgressEntity.userId, testUserId),
          ),
        );

      expect(progressRecords).toHaveLength(2);
      expect(progressRecords[0].completedAt).toBe(firstAttemptData.completedAt);
      expect(progressRecords[1].completedAt).toBe(
        secondAttemptData.completedAt,
      );
    });

    it('should validate progress input', async () => {
      const invalidData = {
        lessonId: 999,
        startedAt: 'not a date',
        completedAt: 'also not a date',
      };

      const response = await request(app)
        .post('/api/lesson-progress')
        .send(invalidData)
        .expect(400);

      expect(response.body).toMatchObject({
        message: 'Validation failed',
        errors: expect.arrayContaining([
          'startedAt must be a valid ISO 8601 date string',
          'completedAt must be a valid ISO 8601 date string',
        ]),
      });

      // Verify no progress was recorded in the database
      const dbProgress = await db.select().from(LessonProgressEntity);
      expect(dbProgress).toHaveLength(0);
    });

    it('should return 404 for non-existent lesson', async () => {
      const now = new Date();
      const progressData = {
        lessonId: 999,
        startedAt: now.toISOString(),
        completedAt: new Date(now.getTime() + 300000).toISOString(),
        userId: testUserId,
      };

      const response = await request(app)
        .post('/api/lesson-progress')
        .send(progressData)
        .expect(404);

      expect(response.body).toMatchObject({
        message: expect.stringContaining('not found'),
      });

      // Verify no progress was recorded in the database
      const dbProgress = await db.select().from(LessonProgressEntity);
      expect(dbProgress).toHaveLength(0);
    });
  });
});
