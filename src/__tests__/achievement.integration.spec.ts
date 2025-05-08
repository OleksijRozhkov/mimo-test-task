/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { eq, and } from 'drizzle-orm';
import request from 'supertest';

import {
  AchievementEntity,
  UserAchievementEntity,
  UserEntity,
  CourseEntity,
  ChapterEntity,
  LessonEntity,
  LessonProgressEntity,
  Lesson,
} from '../db/schema';
import { ObjectiveType } from '../db/schema/achievement.schema';
import {
  CreateAchievementRequestDto,
  UpdateAchievementRequestDto,
} from '../modules/achievement/dtos';
import { RecordProgressRequestDto } from '../modules/lesson-progress/dtos';

import { db, setupTestApp } from './setup';
import { randomString } from './utils';

describe('Achievements API Integration Tests', () => {
  const app = setupTestApp();

  let testUserId: number;
  let testCourseId: number;
  let testChapterId: number;
  let testLessonId: number;

  beforeEach(async () => {
    // Clear tables before each test
    await db.delete(UserAchievementEntity);
    await db.delete(AchievementEntity);
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

    // Create a test course, chapter, and lesson
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

  describe('Admin Endpoints', () => {
    describe('POST /api/admin/achievements', () => {
      it('should create a new achievement', async () => {
        const achievementData: CreateAchievementRequestDto = {
          name: 'Test Achievement',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        };

        const response = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: achievementData.name,
          description: achievementData.description,
          type: achievementData.type,
          target: achievementData.target,
        });

        // Verify achievement was created in the database
        const [achievement] = await db
          .select()
          .from(AchievementEntity)
          .where(eq(AchievementEntity.name, achievementData.name));

        expect(achievement).toBeDefined();
        expect(achievement.name).toBe(achievementData.name);
        expect(achievement.type).toBe(achievementData.type);
      });

      it('should create a course completion achievement', async () => {
        const achievementData: CreateAchievementRequestDto = {
          name: 'Course Master',
          description: 'Complete the entire course',
          type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
          target: 1,
          courseId: testCourseId,
        };

        const response = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(201);

        expect(response.body).toMatchObject({
          id: expect.any(Number),
          name: achievementData.name,
          description: achievementData.description,
          type: achievementData.type,
          target: achievementData.target,
          courseId: testCourseId,
        });
      });

      it('should return error if target is not 1 for course completion achievement', async () => {
        const achievementData: CreateAchievementRequestDto = {
          name: 'Invalid Course Master',
          description: 'Complete the entire course',
          type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
          target: 2, // Invalid target
          courseId: testCourseId,
        };

        const response = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(400);

        expect(response.body).toMatchObject({
          message: expect.stringContaining(
            'Target must be 1 for course completion achievements',
          ),
        });
      });

      it('should validate achievement input', async () => {
        const invalidData = {
          name: '', // Empty name
          description: '', // Empty description
          type: 'invalid_type', // Invalid type
          target: -1, // Negative target
        };

        const response = await request(app)
          .post('/api/admin/achievements')
          .send(invalidData)
          .expect(400);

        expect(response.body).toMatchObject({
          message: 'Validation failed',
          errors: [
            'name should not be empty',
            'description should not be empty',
            `type must be one of the following values: ${Object.values(
              ObjectiveType,
            ).join(', ')}`,
            'target must not be less than 1',
          ],
        });
      });
    });

    describe('GET /api/admin/achievements', () => {
      it('should return all achievements', async () => {
        // Create some test achievements
        const achievement1: CreateAchievementRequestDto = {
          name: 'Test Achievement 1',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        };

        const achievement2: CreateAchievementRequestDto = {
          name: 'Test Achievement 2',
          description: 'Complete 3 chapters',
          type: ObjectiveType.CHAPTERS_COMPLETED,
          target: 3,
        };

        await request(app)
          .post('/api/admin/achievements')
          .send(achievement1)
          .expect(201);

        await request(app)
          .post('/api/admin/achievements')
          .send(achievement2)
          .expect(201);

        const response = await request(app)
          .get('/api/admin/achievements')
          .expect(200);

        expect(response.body).toMatchObject({
          achievements: expect.arrayContaining([
            expect.objectContaining({
              name: achievement1.name,
              type: achievement1.type,
            }),
            expect.objectContaining({
              name: achievement2.name,
              type: achievement2.type,
            }),
          ]),
        });
      });
    });

    describe('GET /api/admin/achievements/:id', () => {
      it('should return a specific achievement', async () => {
        // Create a test achievement
        const achievementData: CreateAchievementRequestDto = {
          name: 'Test Achievement',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        };

        const createResponse = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(201);

        const achievementId = createResponse.body.id;

        const response = await request(app)
          .get(`/api/admin/achievements/${achievementId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          id: achievementId,
          name: achievementData.name,
          description: achievementData.description,
          type: achievementData.type,
          target: achievementData.target,
        });
      });

      it('should return 404 for non-existent achievement', async () => {
        const response = await request(app)
          .get('/api/admin/achievements/999')
          .expect(404);

        expect(response.body).toMatchObject({
          message: expect.stringContaining('not found'),
        });
      });
    });

    describe('PUT /api/admin/achievements/:id', () => {
      it('should update an achievement', async () => {
        // Create a test achievement
        const achievementData: CreateAchievementRequestDto = {
          name: 'Test Achievement',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        };

        const createResponse = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(201);

        const achievementId = createResponse.body.id;

        // Update the achievement
        const updateData: UpdateAchievementRequestDto = {
          name: 'Updated Achievement',
        };

        const response = await request(app)
          .put(`/api/admin/achievements/${achievementId}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toMatchObject({
          id: achievementId,
          name: updateData.name,
          description: achievementData.description, // Unchanged
          type: achievementData.type, // Unchanged
        });
      });

      it('should return 404 for non-existent achievement', async () => {
        const updateData: UpdateAchievementRequestDto = {
          name: 'Updated Achievement',
        };

        const response = await request(app)
          .put('/api/admin/achievements/999')
          .send(updateData)
          .expect(404);

        expect(response.body).toMatchObject({
          message: expect.stringContaining('not found'),
        });
      });
    });

    describe('DELETE /api/admin/achievements/:id', () => {
      it('should delete an achievement', async () => {
        // Create a test achievement
        const achievementData: CreateAchievementRequestDto = {
          name: 'Test Achievement',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        };

        const createResponse = await request(app)
          .post('/api/admin/achievements')
          .send(achievementData)
          .expect(201);

        const achievementId = createResponse.body.id;

        // Delete the achievement
        await request(app)
          .delete(`/api/admin/achievements/${achievementId}`)
          .expect(204);

        // Verify achievement was deleted
        const [achievement] = await db
          .select()
          .from(AchievementEntity)
          .where(eq(AchievementEntity.id, achievementId));

        expect(achievement).toBeUndefined();
      });

      it('should return 404 for non-existent achievement', async () => {
        const response = await request(app)
          .delete('/api/admin/achievements/999')
          .expect(404);

        expect(response.body).toMatchObject({
          message: expect.stringContaining('not found'),
        });
      });
    });

    it('should not allow target updates', async () => {
      // Create achievement with target 5 directly in DB
      const [achievement] = await db
        .insert(AchievementEntity)
        .values({
          name: 'Test Achievement',
          description: 'Complete 5 lessons',
          type: ObjectiveType.LESSONS_COMPLETED,
          target: 5,
        })
        .returning();

      // Attempt to update achievement target to 10
      const updateData = {
        name: 'Updated Achievement',
        target: 10,
      };

      await request(app)
        .put(`/api/admin/achievements/${achievement.id}`)
        .send(updateData)
        .expect(400); // Should return 400 Bad Request as target updates are not allowed

      // Verify target was not updated
      const [updatedAchievement] = await db
        .select()
        .from(AchievementEntity)
        .where(eq(AchievementEntity.id, achievement.id));

      expect(updatedAchievement.target).toBe(5); // Target should remain unchanged
      expect(updatedAchievement.name).toBe('Test Achievement'); // Name should also remain unchanged
    });
  });

  describe('User Endpoints', () => {
    describe('GET /api/achievements', () => {
      it('should return user achievements with progress', async () => {
        // Create a test achievement
        const [createdAchievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Test Achievement',
            description: 'Complete 3 lessons',
            type: ObjectiveType.LESSONS_COMPLETED,
            target: 3,
          })
          .returning();

        const achievementId = createdAchievement.id;

        // Complete a lesson to trigger achievement progress
        const now = new Date();
        const progressData: RecordProgressRequestDto = {
          lessonId: testLessonId,
          startedAt: now.toISOString(),
          completedAt: new Date(now.getTime() + 300000).toISOString(),
          userId: testUserId,
        };

        // Complete the lesson
        await request(app)
          .post('/api/lesson-progress')
          .send(progressData)
          .expect(201);

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        const achievement = response.body.achievements.find(
          (a: any) => a.id === achievementId,
        );
        expect(achievement).toBeDefined();
        expect(achievement).toMatchObject({
          id: achievementId,
          name: createdAchievement.name,
          description: createdAchievement.description,
          progress: 1, // One lesson completed
          completed: false,
          target: createdAchievement.target,
        });
      });

      it('should count unique lessons for achievement progress when same lesson is completed multiple times', async () => {
        // Create achievement requiring 3 lessons directly in DB
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Test Achievement',
            description: 'Complete 3 lessons',
            type: ObjectiveType.LESSONS_COMPLETED,
            target: 3,
          })
          .returning();

        // Complete the same lesson 3 times
        const now = new Date();
        for (let i = 0; i < 3; i++) {
          const progressData: RecordProgressRequestDto = {
            lessonId: testLessonId,
            startedAt: new Date(now.getTime() - (i + 1) * 300000).toISOString(), // Start 5 minutes before completion
            completedAt: new Date(now.getTime() - i * 300000).toISOString(), // Complete each attempt 5 minutes apart
            userId: testUserId,
          };

          await request(app)
            .post('/api/lesson-progress')
            .send(progressData)
            .expect(201);
        }

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        const achievementResponse = response.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(achievementResponse).toBeDefined();
        expect(achievementResponse).toMatchObject({
          id: achievement.id,
          progress: 1, // Should be 1, not 3
          completed: false,
          target: achievement.target,
        });
      });

      it('should track progress for multiple achievements simultaneously', async () => {
        // Create different types of achievements directly in DB
        const [lessonAchievement, chapterAchievement, courseAchievement] =
          await Promise.all([
            db
              .insert(AchievementEntity)
              .values({
                name: 'Lesson Master',
                description: 'Complete 2 lessons',
                type: ObjectiveType.LESSONS_COMPLETED,
                target: 2,
              })
              .returning(),
            db
              .insert(AchievementEntity)
              .values({
                name: 'Chapter Master',
                description: 'Complete 1 chapter',
                type: ObjectiveType.CHAPTERS_COMPLETED,
                target: 1,
              })
              .returning(),
            db
              .insert(AchievementEntity)
              .values({
                name: 'Course Master',
                description: 'Complete the course',
                type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
                target: 1,
                courseId: testCourseId,
              })
              .returning(),
          ]);

        // Create and complete a second lesson in the same chapter
        const [secondLesson] = await db
          .insert(LessonEntity)
          .values({
            name: `Test Lesson 2 ${randomString()}`,
            order: 2,
            chapterId: testChapterId,
          })
          .returning();

        // Complete both lessons
        const now = new Date();
        await Promise.all([
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: testLessonId,
              startedAt: new Date(now.getTime() - 300000).toISOString(), // Start 5 minutes before completion
              completedAt: new Date(now.getTime() - 150000).toISOString(), // Complete 2.5 minutes before second lesson
              userId: testUserId,
            })
            .expect(201),
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: secondLesson.id,
              startedAt: new Date(now.getTime() - 120000).toISOString(), // Start 2 minutes before completion
              completedAt: now.toISOString(), // Complete at current time
              userId: testUserId,
            })
            .expect(201),
        ]);

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          achievements: expect.arrayContaining([
            expect.objectContaining({
              id: lessonAchievement[0].id,
              progress: 2,
              completed: true,
              target: lessonAchievement[0].target,
            }),
            expect.objectContaining({
              id: chapterAchievement[0].id,
              progress: 1,
              completed: true,
              target: chapterAchievement[0].target,
            }),
            expect.objectContaining({
              id: courseAchievement[0].id,
              progress: 1,
              completed: true,
              target: courseAchievement[0].target,
            }),
          ]),
        });
      });

      it('should mark achievement as completed when target is reached', async () => {
        // Create achievement requiring 2 lessons directly in DB
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Test Achievement',
            description: 'Complete 2 lessons',
            type: ObjectiveType.LESSONS_COMPLETED,
            target: 2,
          })
          .returning();

        // Create and complete a second lesson
        const [secondLesson] = await db
          .insert(LessonEntity)
          .values({
            name: `Test Lesson 2 ${randomString()}`,
            order: 2,
            chapterId: testChapterId,
          })
          .returning();

        // Complete both lessons
        const now = new Date();
        await Promise.all([
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: testLessonId,
              startedAt: new Date(now.getTime() - 300000).toISOString(), // Start 5 minutes before completion
              completedAt: new Date(now.getTime() - 150000).toISOString(), // Complete 2.5 minutes before second lesson
              userId: testUserId,
            })
            .expect(201),
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: secondLesson.id,
              startedAt: new Date(now.getTime() - 120000).toISOString(), // Start 2 minutes before completion
              completedAt: now.toISOString(), // Complete at current time
              userId: testUserId,
            })
            .expect(201),
        ]);

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        const achievementResponse = response.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(achievementResponse).toBeDefined();
        expect(achievementResponse).toMatchObject({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          progress: achievement.target,
          completed: true,
          target: achievement.target,
        });

        // Verify completedAt timestamp is set
        const [userAchievementRecord] = await db
          .select()
          .from(UserAchievementEntity)
          .where(
            and(
              eq(UserAchievementEntity.userId, testUserId),
              eq(UserAchievementEntity.achievementId, achievement.id),
            ),
          );

        expect(userAchievementRecord.completedAt).toBeDefined();
      });

      it('should maintain progress after achievement completion', async () => {
        // Create achievement requiring 3 lessons directly in DB
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Test Achievement',
            description: 'Complete 3 lessons',
            type: ObjectiveType.LESSONS_COMPLETED,
            target: 3,
          })
          .returning();

        // Create 4 lessons
        const createdLessons: Lesson[] = [];
        for (let i = 0; i < 4; i++) {
          const [lesson] = await db
            .insert(LessonEntity)
            .values({
              name: `Test Lesson ${i + 1} ${randomString()}`,
              order: i + 1,
              chapterId: testChapterId,
            })
            .returning();
          createdLessons.push(lesson);
        }

        // Complete all lessons
        const now = new Date();
        await Promise.all(
          createdLessons.map((lesson, index) =>
            request(app)
              .post('/api/lesson-progress')
              .send({
                lessonId: lesson.id,
                startedAt: new Date(
                  now.getTime() - (index + 1) * 300000,
                ).toISOString(), // Start 5 minutes before completion
                completedAt: new Date(
                  now.getTime() - index * 300000,
                ).toISOString(), // Complete each lesson 5 minutes apart
                userId: testUserId,
              })
              .expect(201),
          ),
        );

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        const achievementResponse = response.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(achievementResponse).toBeDefined();
        expect(achievementResponse).toMatchObject({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          progress: achievement.target,
          completed: true,
          target: achievement.target,
        });
      });

      it('should track course-specific achievement progress correctly', async () => {
        // Create two courses
        const [course1, course2] = await Promise.all([
          db
            .insert(CourseEntity)
            .values({ name: `Test Course 1 ${randomString()}` })
            .returning(),
          db
            .insert(CourseEntity)
            .values({ name: `Test Course 2 ${randomString()}` })
            .returning(),
        ]);

        // Create chapters for both courses
        const [chapter1, chapter2] = await Promise.all([
          db
            .insert(ChapterEntity)
            .values({
              name: `Test Chapter 1 ${randomString()}`,
              order: 1,
              courseId: course1[0].id,
            })
            .returning(),
          db
            .insert(ChapterEntity)
            .values({
              name: `Test Chapter 2 ${randomString()}`,
              order: 1,
              courseId: course2[0].id,
            })
            .returning(),
        ]);

        // Create multiple lessons for both courses to ensure they're not completed
        const [lesson1, lesson2, lesson3] = await Promise.all([
          db
            .insert(LessonEntity)
            .values({
              name: `Test Lesson 1 ${randomString()}`,
              order: 1,
              chapterId: chapter1[0].id,
            })
            .returning(),
          db
            .insert(LessonEntity)
            .values({
              name: `Test Lesson 2 ${randomString()}`,
              order: 2,
              chapterId: chapter1[0].id,
            })
            .returning(),
          db
            .insert(LessonEntity)
            .values({
              name: `Test Lesson 3 ${randomString()}`,
              order: 1,
              chapterId: chapter2[0].id,
            })
            .returning(),
        ]);

        // Create course completion achievements for both courses directly in DB
        const [achievement1, achievement2] = await Promise.all([
          db
            .insert(AchievementEntity)
            .values({
              name: 'Course 1 Master',
              description: 'Complete Course 1',
              type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
              target: 1,
              courseId: course1[0].id,
            })
            .returning(),
          db
            .insert(AchievementEntity)
            .values({
              name: 'Course 2 Master',
              description: 'Complete Course 2',
              type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
              target: 1,
              courseId: course2[0].id,
            })
            .returning(),
        ]);

        // Complete one lesson from course1 and one from course2
        const now = new Date();
        await Promise.all([
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: lesson1[0].id,
              startedAt: new Date(now.getTime() - 300000).toISOString(), // Start 5 minutes before completion
              completedAt: new Date(now.getTime() - 150000).toISOString(), // Complete 2.5 minutes before second lesson
              userId: testUserId,
            })
            .expect(201),
          request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: lesson3[0].id,
              startedAt: new Date(now.getTime() - 120000).toISOString(), // Start 2 minutes before completion
              completedAt: now.toISOString(), // Complete at current time
              userId: testUserId,
            })
            .expect(201),
        ]);

        // Get user achievements
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        // Verify course1 achievement is not completed
        const achievement1Response = response.body.achievements.find(
          (a: any) => a.id === achievement1[0].id,
        );
        expect(achievement1Response).toBeDefined();
        expect(achievement1Response).toMatchObject({
          id: achievement1[0].id,
          name: achievement1[0].name,
          description: achievement1[0].description,
          progress: 0, // Should be 0 as course1 is not fully completed
          completed: false,
          target: achievement1[0].target,
        });

        // Verify course2 achievement is completed
        const achievement2Response = response.body.achievements.find(
          (a: any) => a.id === achievement2[0].id,
        );
        expect(achievement2Response).toBeDefined();
        expect(achievement2Response).toMatchObject({
          id: achievement2[0].id,
          name: achievement2[0].name,
          description: achievement2[0].description,
          progress: achievement2[0].target, // Should be 1 as course2 is completed
          completed: true,
          target: achievement2[0].target,
        });
      });

      it('should handle non-existent user gracefully', async () => {
        const response = await request(app)
          .get('/api/achievements?userId=999')
          .expect(404);

        expect(response.body).toMatchObject({
          message: expect.stringContaining('not found'),
        });
      });

      it('should return empty list for new user', async () => {
        const response = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);

        expect(response.body).toMatchObject({
          achievements: [],
        });
      });

      it('should complete a COURSES_COMPLETED achievement when user finishes all lessons in a course', async () => {
        // Create a COURSES_COMPLETED achievement (target: 1)
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Course Finisher',
            description: 'Complete 1 course',
            type: ObjectiveType.COURSES_COMPLETED,
            target: 1,
          })
          .returning();

        // Create a new course with 2 chapters, each with 2 lessons
        const [course] = await db
          .insert(CourseEntity)
          .values({ name: `Course for COURSES_COMPLETED ${randomString()}` })
          .returning();
        const chapters = await db
          .insert(ChapterEntity)
          .values([
            { name: 'Chapter 1', order: 1, courseId: course.id },
            { name: 'Chapter 2', order: 2, courseId: course.id },
          ])
          .returning();
        const lessons = [];
        for (const chapter of chapters) {
          const [lesson1] = await db
            .insert(LessonEntity)
            .values({
              name: `Lesson 1 for ${chapter.name}`,
              order: 1,
              chapterId: chapter.id,
            })
            .returning();
          const [lesson2] = await db
            .insert(LessonEntity)
            .values({
              name: `Lesson 2 for ${chapter.name}`,
              order: 2,
              chapterId: chapter.id,
            })
            .returning();
          lessons.push(lesson1, lesson2);
        }

        // Complete all lessons in the course
        const now = new Date();
        for (let i = 0; i < lessons.length; i++) {
          await request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: lessons[i].id,
              startedAt: new Date(now.getTime() + i * 1000).toISOString(),
              completedAt: new Date(
                now.getTime() + (i + 1) * 1000,
              ).toISOString(),
              userId: testUserId,
            })
            .expect(201);
        }

        // Check achievement progress
        const res = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);
        const ach = res.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(ach).toBeDefined();
        expect(ach).toMatchObject({
          progress: 1,
          completed: true,
          target: achievement.target,
        });
      });

      it('should complete a COURSES_COMPLETED achievement (target: 2) after finishing two courses', async () => {
        // Create a COURSES_COMPLETED achievement (target: 2)
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Course Double Finisher',
            description: 'Complete 2 courses',
            type: ObjectiveType.COURSES_COMPLETED,
            target: 2,
          })
          .returning();

        // Helper to create a course with 1 chapter and 1 lesson
        async function createCourseWithLesson(courseName: string) {
          const [course] = await db
            .insert(CourseEntity)
            .values({ name: courseName })
            .returning();
          const [chapter] = await db
            .insert(ChapterEntity)
            .values({ name: 'Chapter', order: 1, courseId: course.id })
            .returning();
          const [lesson] = await db
            .insert(LessonEntity)
            .values({ name: 'Lesson', order: 1, chapterId: chapter.id })
            .returning();
          return { course, lesson };
        }

        // Create and complete two courses
        const courseA = await createCourseWithLesson('Course A');
        const courseB = await createCourseWithLesson('Course B');
        const now = new Date();
        await request(app)
          .post('/api/lesson-progress')
          .send({
            lessonId: courseA.lesson.id,
            startedAt: now.toISOString(),
            completedAt: new Date(now.getTime() + 1000).toISOString(),
            userId: testUserId,
          })
          .expect(201);
        await request(app)
          .post('/api/lesson-progress')
          .send({
            lessonId: courseB.lesson.id,
            startedAt: new Date(now.getTime() + 2000).toISOString(),
            completedAt: new Date(now.getTime() + 3000).toISOString(),
            userId: testUserId,
          })
          .expect(201);

        // Check achievement progress
        const res = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);
        const ach = res.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(ach).toBeDefined();
        expect(ach).toMatchObject({
          progress: 2,
          completed: true,
          target: achievement.target,
        });
      });

      it('should not complete a COURSES_COMPLETED achievement (target: 2) if only one course is finished', async () => {
        // Create a COURSES_COMPLETED achievement (target: 2)
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Course Double Finisher',
            description: 'Complete 2 courses',
            type: ObjectiveType.COURSES_COMPLETED,
            target: 2,
          })
          .returning();

        // Helper to create a course with 1 chapter and 1 lesson
        async function createCourseWithLesson(courseName: string) {
          const [course] = await db
            .insert(CourseEntity)
            .values({ name: courseName })
            .returning();
          const [chapter] = await db
            .insert(ChapterEntity)
            .values({ name: 'Chapter', order: 1, courseId: course.id })
            .returning();
          const [lesson] = await db
            .insert(LessonEntity)
            .values({ name: 'Lesson', order: 1, chapterId: chapter.id })
            .returning();
          return { course, lesson };
        }

        // Create and complete only one course
        const courseA = await createCourseWithLesson('Course A');
        const now = new Date();
        await request(app)
          .post('/api/lesson-progress')
          .send({
            lessonId: courseA.lesson.id,
            startedAt: now.toISOString(),
            completedAt: new Date(now.getTime() + 1000).toISOString(),
            userId: testUserId,
          })
          .expect(201);

        // Check achievement progress
        const res = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);
        const ach = res.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(ach).toBeDefined();
        expect(ach).toMatchObject({
          progress: 1,
          completed: false,
          target: achievement.target,
        });
      });

      it('should not complete a COURSES_COMPLETED achievement (target: 1) if only 2 out of 3 chapters are finished', async () => {
        // Create a COURSES_COMPLETED achievement (target: 1)
        const [achievement] = await db
          .insert(AchievementEntity)
          .values({
            name: 'Course Finisher',
            description: 'Complete 1 course',
            type: ObjectiveType.COURSES_COMPLETED,
            target: 1,
          })
          .returning();

        // Create a course with 3 chapters, each with 1 lesson
        const [course] = await db
          .insert(CourseEntity)
          .values({ name: `Course for partial completion ${randomString()}` })
          .returning();
        const chapters = await db
          .insert(ChapterEntity)
          .values([
            { name: 'Chapter 1', order: 1, courseId: course.id },
            { name: 'Chapter 2', order: 2, courseId: course.id },
            { name: 'Chapter 3', order: 3, courseId: course.id },
          ])
          .returning();
        const lessons = [];
        for (const chapter of chapters) {
          const [lesson] = await db
            .insert(LessonEntity)
            .values({
              name: `Lesson for ${chapter.name}`,
              order: 1,
              chapterId: chapter.id,
            })
            .returning();
          lessons.push(lesson);
        }

        // Complete all lessons in only the first two chapters
        const now = new Date();
        for (let i = 0; i < 2; i++) {
          await request(app)
            .post('/api/lesson-progress')
            .send({
              lessonId: lessons[i].id,
              startedAt: new Date(now.getTime() + i * 1000).toISOString(),
              completedAt: new Date(
                now.getTime() + (i + 1) * 1000,
              ).toISOString(),
              userId: testUserId,
            })
            .expect(201);
        }

        // Check achievement progress
        const res = await request(app)
          .get(`/api/achievements?userId=${testUserId}`)
          .expect(200);
        const ach = res.body.achievements.find(
          (a: any) => a.id === achievement.id,
        );
        expect(ach).toBeDefined();
        expect(ach).toMatchObject({
          progress: 0,
          completed: false,
          target: achievement.target,
        });
      });
    });
  });
});
