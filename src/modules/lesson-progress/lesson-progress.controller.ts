import { Request, Response } from 'express';

import { RecordProgressRequestDto, RecordProgressResponseDto } from './dtos';
import { lessonProgressService } from './lesson-progress.service';

export class LessonProgressController {
  /**
   * @swagger
   * /api/lesson-progress:
   *   post:
   *     tags: [Progress]
   *     summary: Record lesson progress
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               lessonId:
   *                 type: integer
   *               startedAt:
   *                 type: string
   *                 format: date-time
   *               completedAt:
   *                 type: string
   *                 format: date-time
   *               userId:
   *                 type: integer
   *                 description: Optional. If not provided, defaults to 1.
   *             required:
   *               - lessonId
   *               - startedAt
   *               - completedAt
   *     responses:
   *       201:
   *         description: Progress recorded
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 progress:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                     lessonId:
   *                       type: integer
   *                     userId:
   *                       type: integer
   *                     startedAt:
   *                       type: string
   *                       format: date-time
   *                     completedAt:
   *                       type: string
   *                       format: date-time
   */
  public async recordProgress(
    req: Request<any, RecordProgressResponseDto, RecordProgressRequestDto>,
    res: Response<RecordProgressResponseDto>,
  ): Promise<Response<RecordProgressResponseDto>> {
    const result = await lessonProgressService.recordProgress(req.body);
    return res.status(201).json(result);
  }
}

export const lessonProgressController = new LessonProgressController();
