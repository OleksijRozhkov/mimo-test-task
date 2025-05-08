import { CreateAchievementRequestDto } from '../modules/achievement/dtos';

import {
  CourseEntity,
  ChapterEntity,
  LessonEntity,
  UserEntity,
  AchievementEntity,
  UserAchievementEntity,
} from './schema';
import { ObjectiveType } from './schema/achievement.schema';

import { db } from './index';

export async function seedDatabase(): Promise<void> {
  try {
    // Check if database is already seeded
    const existingCourses = await db.select().from(CourseEntity);
    if (existingCourses.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // Create courses
    const courseData = [
      { name: 'Swift' },
      { name: 'Javascript' },
      { name: 'C#' },
    ];
    const createdCourses = await db
      .insert(CourseEntity)
      .values(courseData)
      .returning();

    // Create chapters for each course
    for (const course of createdCourses) {
      const chapterData = Array.from({ length: 5 }, (_, i) => ({
        name: `${course.name} Chapter ${i + 1}`,
        order: i + 1,
        courseId: course.id,
      }));
      const createdChapters = await db
        .insert(ChapterEntity)
        .values(chapterData)
        .returning();

      // Create lessons for each chapter
      for (const chapter of createdChapters) {
        const lessonData = Array.from({ length: 5 }, (_, i) => ({
          name: `Lesson ${i + 1}`,
          order: i + 1,
          chapterId: chapter.id,
        }));
        await db.insert(LessonEntity).values(lessonData);
      }
    }

    // Create a default user
    const [user] = await db
      .insert(UserEntity)
      .values({ name: 'Default User' })
      .returning();

    // Create achievements
    const achievementsData: CreateAchievementRequestDto[] = [
      {
        name: 'Beginner Learner',
        description: 'Complete 5 lessons',
        type: ObjectiveType.LESSONS_COMPLETED,
        target: 5,
      },
      {
        name: 'Intermediate Learner',
        description: 'Complete 25 lessons',
        type: ObjectiveType.LESSONS_COMPLETED,
        target: 25,
      },
      {
        name: 'Advanced Learner',
        description: 'Complete 50 lessons',
        type: ObjectiveType.LESSONS_COMPLETED,
        target: 50,
      },
      {
        name: 'Chapter Novice',
        description: 'Complete 1 chapter',
        type: ObjectiveType.CHAPTERS_COMPLETED,
        target: 1,
      },
      {
        name: 'Chapter Master',
        description: 'Complete 5 chapters',
        type: ObjectiveType.CHAPTERS_COMPLETED,
        target: 5,
      },
      {
        name: 'Course Novice',
        description: 'Complete 1 course',
        type: ObjectiveType.COURSES_COMPLETED,
        target: 1,
      },
      {
        name: 'Course Master',
        description: 'Complete 5 courses',
        type: ObjectiveType.COURSES_COMPLETED,
        target: 5,
      },
    ];

    // Course completion achievements
    for (const course of createdCourses) {
      achievementsData.push({
        name: `${course.name} Expert`,
        description: `Complete the ${course.name} course`,
        type: ObjectiveType.SPECIFIC_COURSE_COMPLETED,
        target: 1,
        courseId: course.id,
      });
    }

    // Save achievements and create user achievement entries
    for (const achievementData of achievementsData) {
      const [achievement] = await db
        .insert(AchievementEntity)
        .values({
          name: achievementData.name,
          description: achievementData.description,
          type: achievementData.type,
          target: achievementData.target,
          courseId: achievementData.courseId,
        })
        .returning();

      await db.insert(UserAchievementEntity).values({
        userId: user.id,
        achievementId: achievement.id,
        completed: false,
        progress: 0,
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
