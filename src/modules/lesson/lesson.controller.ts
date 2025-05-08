import { Request, Response } from 'express';

import { ChapterIdRequestDto } from '../chapter/dtos';

import {
  CreateLessonRequestDto,
  CreateLessonResponseDto,
  UpdateLessonRequestDto,
  UpdateLessonResponseDto,
  LessonIdRequestDto,
  GetLessonResponseDto,
  GetAllLessonsResponseDto,
} from './dtos';
import { lessonService } from './lesson.service';

export class LessonController {
  /**
   * @swagger
   * /api/lessons:
   *   post:
   *     tags: [Lessons]
   *     summary: Create a new lesson
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 100
   *               order:
   *                 type: integer
   *                 minimum: 1
   *               chapterId:
   *                 type: integer
   *             required:
   *               - name
   *               - order
   *               - chapterId
   *     responses:
   *       201:
   *         description: Lesson created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 order:
   *                   type: integer
   *                 chapterId:
   *                   type: integer
   */
  public async createLesson(
    req: Request<any, CreateLessonResponseDto, CreateLessonRequestDto>,
    res: Response<CreateLessonResponseDto>,
  ): Promise<Response<CreateLessonResponseDto>> {
    const lesson = await lessonService.createLesson(req.body);
    return res.status(201).json({
      message: 'Lesson created successfully',
      lesson,
    });
  }

  /**
   * @swagger
   * /api/lessons/{lessonId}:
   *   put:
   *     tags: [Lessons]
   *     summary: Update a lesson
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 100
   *               order:
   *                 type: integer
   *                 minimum: 1
   *               chapterId:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Lesson updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 order:
   *                   type: integer
   *                 chapterId:
   *                   type: integer
   */
  public async updateLesson(
    req: Request<
      LessonIdRequestDto,
      UpdateLessonResponseDto,
      UpdateLessonRequestDto
    >,
    res: Response<UpdateLessonResponseDto>,
  ): Promise<Response<UpdateLessonResponseDto>> {
    const lesson = await lessonService.updateLesson(
      req.params.lessonId,
      req.body,
    );
    return res.json({
      message: 'Lesson updated successfully',
      lesson,
    });
  }

  /**
   * @swagger
   * /api/lessons/{lessonId}:
   *   delete:
   *     tags: [Lessons]
   *     summary: Delete a lesson
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Lesson deleted
   */
  public async deleteLesson(
    req: Request<LessonIdRequestDto>,
    res: Response<void>,
  ): Promise<Response<void>> {
    await lessonService.deleteLesson(req.params.lessonId);
    return res.status(204).send();
  }

  /**
   * @swagger
   * /api/lessons/{lessonId}:
   *   get:
   *     tags: [Lessons]
   *     summary: Get a lesson by ID
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Lesson found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 order:
   *                   type: integer
   *                 chapterId:
   *                   type: integer
   */
  public async getLessonById(
    req: Request<LessonIdRequestDto, GetLessonResponseDto>,
    res: Response<GetLessonResponseDto>,
  ): Promise<Response<GetLessonResponseDto>> {
    const lesson = await lessonService.getLessonById(req.params.lessonId);
    return res.json({ lesson });
  }

  /**
   * @swagger
   * /api/lessons:
   *   get:
   *     tags: [Lessons]
   *     summary: Get all lessons
   *     parameters:
   *       - in: query
   *         name: chapterId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of lessons
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 lessons:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   *                       order:
   *                         type: integer
   *                       chapterId:
   *                         type: integer
   */
  public async getAllLessons(
    req: Request<any, GetAllLessonsResponseDto, any, ChapterIdRequestDto>,
    res: Response<GetAllLessonsResponseDto>,
  ): Promise<Response<GetAllLessonsResponseDto>> {
    const lessons = await lessonService.getAllLessons(req.query.chapterId);
    return res.json({
      lessons: lessons.map((lesson) => ({
        id: lesson.id,
        name: lesson.name,
        order: lesson.order,
        chapterId: lesson.chapterId,
      })),
    });
  }
}

export const lessonController = new LessonController();
