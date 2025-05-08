import { Express } from 'express';

import { adminAchievementController } from './modules/achievement/admin-achievement.controller';
import {
  CreateAchievementRequestDto,
  UpdateAchievementRequestDto,
  AchievementIdRequestDto,
} from './modules/achievement/dtos';
import { userAchievementController } from './modules/achievement/user-achievement.controller';
import { chapterController } from './modules/chapter/chapter.controller';
import {
  CreateChapterRequestDto,
  UpdateChapterRequestDto,
  ChapterIdRequestDto,
} from './modules/chapter/dtos';
import { courseController } from './modules/course/course.controller';
import {
  CourseIdRequestDto,
  CreateCourseRequestDto,
  UpdateCourseRequestDto,
} from './modules/course/dtos';
import {
  CreateLessonRequestDto,
  UpdateLessonRequestDto,
  LessonIdRequestDto,
} from './modules/lesson/dtos';
import { lessonController } from './modules/lesson/lesson.controller';
import { RecordProgressRequestDto } from './modules/lesson-progress/dtos';
import { lessonProgressController } from './modules/lesson-progress/lesson-progress.controller';
import {
  CreateUserRequestDto,
  UpdateUserRequestDto,
  UserIdRequestDto,
} from './modules/user/dtos';
import { userController } from './modules/user/user.controller';
import { createRoute } from './utils/route-factory';

export function setupRoutes(app: Express): void {
  // Course endpoints
  app.post(
    '/api/courses',
    ...createRoute(courseController.createCourse.bind(courseController), {
      body: CreateCourseRequestDto,
    }),
  );
  app.get(
    '/api/courses',
    ...createRoute(courseController.getAllCourses.bind(courseController)),
  );
  app.get(
    '/api/courses/:courseId',
    ...createRoute(courseController.getCourse.bind(courseController), {
      param: CourseIdRequestDto,
    }),
  );
  app.put(
    '/api/courses/:courseId',
    ...createRoute(courseController.updateCourse.bind(courseController), {
      param: CourseIdRequestDto,
      body: UpdateCourseRequestDto,
    }),
  );
  app.delete(
    '/api/courses/:courseId',
    ...createRoute(courseController.deleteCourse.bind(courseController), {
      param: CourseIdRequestDto,
    }),
  );

  // User endpoints
  app.post(
    '/api/users',
    ...createRoute(userController.createUser.bind(userController), {
      body: CreateUserRequestDto,
    }),
  );
  app.get(
    '/api/users',
    ...createRoute(userController.getAllUsers.bind(userController)),
  );
  app.get(
    '/api/users/:userId',
    ...createRoute(userController.getUser.bind(userController), {
      param: UserIdRequestDto,
    }),
  );
  app.put(
    '/api/users/:userId',
    ...createRoute(userController.updateUser.bind(userController), {
      param: UserIdRequestDto,
      body: UpdateUserRequestDto,
    }),
  );
  app.delete(
    '/api/users/:userId',
    ...createRoute(userController.deleteUser.bind(userController), {
      param: UserIdRequestDto,
    }),
  );

  // Chapter endpoints
  app.post(
    '/api/chapters',
    ...createRoute(chapterController.createChapter.bind(chapterController), {
      body: CreateChapterRequestDto,
    }),
  );
  app.get(
    '/api/chapters',
    ...createRoute(chapterController.getAllChapters.bind(chapterController), {
      query: CourseIdRequestDto,
    }),
  );
  app.get(
    '/api/chapters/:chapterId',
    ...createRoute(chapterController.getChapterById.bind(chapterController), {
      param: ChapterIdRequestDto,
    }),
  );
  app.put(
    '/api/chapters/:chapterId',
    ...createRoute(chapterController.updateChapter.bind(chapterController), {
      param: ChapterIdRequestDto,
      body: UpdateChapterRequestDto,
    }),
  );
  app.delete(
    '/api/chapters/:chapterId',
    ...createRoute(chapterController.deleteChapter.bind(chapterController), {
      param: ChapterIdRequestDto,
    }),
  );

  // Lesson endpoints
  app.post(
    '/api/lessons',
    ...createRoute(lessonController.createLesson.bind(lessonController), {
      body: CreateLessonRequestDto,
    }),
  );
  app.get(
    '/api/lessons',
    ...createRoute(lessonController.getAllLessons.bind(lessonController), {
      query: ChapterIdRequestDto,
    }),
  );
  app.get(
    '/api/lessons/:lessonId',
    ...createRoute(lessonController.getLessonById.bind(lessonController), {
      param: LessonIdRequestDto,
    }),
  );
  app.put(
    '/api/lessons/:lessonId',
    ...createRoute(lessonController.updateLesson.bind(lessonController), {
      param: LessonIdRequestDto,
      body: UpdateLessonRequestDto,
    }),
  );
  app.delete(
    '/api/lessons/:lessonId',
    ...createRoute(lessonController.deleteLesson.bind(lessonController), {
      param: LessonIdRequestDto,
    }),
  );

  // Lesson progress endpoint
  app.post(
    '/api/lesson-progress',
    ...createRoute(
      lessonProgressController.recordProgress.bind(lessonProgressController),
      {
        body: RecordProgressRequestDto,
      },
    ),
  );

  // Achievements endpoint
  app.get(
    '/api/achievements',
    ...createRoute(
      userAchievementController.getUserAchievements.bind(
        userAchievementController,
      ),
    ),
  );

  // Achievement management endpoints
  app.post(
    '/api/admin/achievements',
    ...createRoute(
      adminAchievementController.createAchievement.bind(
        adminAchievementController,
      ),
      {
        body: CreateAchievementRequestDto,
      },
    ),
  );
  app.get(
    '/api/admin/achievements',
    ...createRoute(
      adminAchievementController.getAllAchievements.bind(
        adminAchievementController,
      ),
    ),
  );
  app.get(
    '/api/admin/achievements/:achievementId',
    ...createRoute(
      adminAchievementController.getAchievement.bind(
        adminAchievementController,
      ),
      {
        param: AchievementIdRequestDto,
      },
    ),
  );
  app.put(
    '/api/admin/achievements/:achievementId',
    ...createRoute(
      adminAchievementController.updateAchievement.bind(
        adminAchievementController,
      ),
      {
        param: AchievementIdRequestDto,
        body: UpdateAchievementRequestDto,
      },
    ),
  );
  app.delete(
    '/api/admin/achievements/:achievementId',
    ...createRoute(
      adminAchievementController.deleteAchievement.bind(
        adminAchievementController,
      ),
      {
        param: AchievementIdRequestDto,
      },
    ),
  );
}
