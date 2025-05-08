import { Request, Response } from 'express';

import { chapterService } from './chapter.service';
import {
  CreateChapterRequestDto,
  CreateChapterResponseDto,
  UpdateChapterRequestDto,
} from './dtos';
import { ChapterIdRequestDto } from './dtos/params.dto';

export class ChapterController {
  /**
   * @swagger
   * /api/chapters:
   *   post:
   *     tags: [Chapters]
   *     summary: Create a new chapter
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
   *               courseId:
   *                 type: integer
   *                 minimum: 1
   *             required:
   *               - name
   *               - order
   *               - courseId
   *     responses:
   *       201:
   *         description: Chapter created successfully
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
   *                 courseId:
   *                   type: integer
   *       400:
   *         description: Validation error or invalid chapter order
   *       404:
   *         description: Course not found
   */
  public async createChapter(
    req: Request<any, CreateChapterResponseDto, CreateChapterRequestDto>,
    res: Response<CreateChapterResponseDto>,
  ): Promise<Response<CreateChapterResponseDto>> {
    const chapter = await chapterService.createChapter(req.body);
    return res.status(201).json({
      id: chapter.id,
      name: chapter.name,
      order: chapter.order,
      courseId: chapter.courseId,
    });
  }

  /**
   * @swagger
   * /api/chapters/{chapterId}:
   *   put:
   *     tags: [Chapters]
   *     summary: Update a chapter
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
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
   *               courseId:
   *                 type: integer
   *                 minimum: 1
   *     responses:
   *       200:
   *         description: Chapter updated successfully
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
   *                 courseId:
   *                   type: integer
   *       400:
   *         description: Validation error or invalid chapter order
   *       404:
   *         description: Chapter not found
   */
  public async updateChapter(
    req: Request<
      ChapterIdRequestDto,
      CreateChapterResponseDto,
      UpdateChapterRequestDto
    >,
    res: Response<CreateChapterResponseDto>,
  ): Promise<Response<CreateChapterResponseDto>> {
    const updatedChapter = await chapterService.updateChapter(
      req.params.chapterId,
      req.body,
    );
    return res.json({
      id: updatedChapter.id,
      name: updatedChapter.name,
      order: updatedChapter.order,
      courseId: updatedChapter.courseId,
    });
  }

  /**
   * @swagger
   * /api/chapters/{chapterId}:
   *   delete:
   *     tags: [Chapters]
   *     summary: Delete a chapter
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       204:
   *         description: Chapter deleted successfully
   *       404:
   *         description: Chapter not found
   */
  public async deleteChapter(
    req: Request<ChapterIdRequestDto>,
    res: Response<void>,
  ): Promise<Response<void>> {
    await chapterService.deleteChapter(req.params.chapterId);
    return res.status(204).send();
  }

  /**
   * @swagger
   * /api/chapters/{chapterId}:
   *   get:
   *     tags: [Chapters]
   *     summary: Get a chapter by ID
   *     parameters:
   *       - in: path
   *         name: chapterId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       200:
   *         description: Chapter found
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
   *                 courseId:
   *                   type: integer
   *       404:
   *         description: Chapter not found
   */
  public async getChapterById(
    req: Request<ChapterIdRequestDto, CreateChapterResponseDto>,
    res: Response<CreateChapterResponseDto>,
  ): Promise<Response<CreateChapterResponseDto>> {
    const chapter = await chapterService.getChapterById(req.params.chapterId);
    return res.json({
      id: chapter.id,
      name: chapter.name,
      order: chapter.order,
      courseId: chapter.courseId,
    });
  }

  /**
   * @swagger
   * /api/chapters:
   *   get:
   *     tags: [Chapters]
   *     summary: Get all chapters
   *     parameters:
   *       - in: query
   *         name: courseId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       200:
   *         description: List of chapters
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 chapters:
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
   *                       courseId:
   *                         type: integer
   *       404:
   *         description: Course not found
   */
  public async getAllChapters(
    req: Request<any, any, any, { courseId: number }>,
    res: Response<any>,
  ): Promise<Response<any>> {
    const chapters = await chapterService.getAllChapters(req.query.courseId);
    return res.json({
      chapters: chapters.map((chapter) => ({
        id: chapter.id,
        name: chapter.name,
        order: chapter.order,
        courseId: chapter.courseId,
      })),
    });
  }
}

export const chapterController = new ChapterController();
