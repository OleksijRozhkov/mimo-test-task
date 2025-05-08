import { Request, Response } from 'express';

import { adminAchievementService } from './admin-achievement.service';
import {
  CreateAchievementRequestDto,
  CreateAchievementResponseDto,
  UpdateAchievementRequestDto,
  UpdateAchievementResponseDto,
  AchievementIdRequestDto,
  AchievementsResponseDto,
} from './dtos';

export class AdminAchievementController {
  /**
   * @swagger
   * /api/admin/achievements:
   *   post:
   *     tags: [Achievements]
   *     summary: Create a new achievement
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [lessons_completed, chapters_completed, course_completed]
   *               target:
   *                 type: integer
   *               courseId:
   *                 type: integer
   *             required:
   *               - name
   *               - description
   *               - type
   *               - target
   *           example:
   *             name: "Complete 5 lessons"
   *             description: "Finish any 5 lessons."
   *             type: "lessons_completed"
   *             target: 5
   *     responses:
   *       201:
   *         description: Achievement created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 description:
   *                   type: string
   *                 type:
   *                   type: string
   *                   enum: [lessons_completed, chapters_completed, course_completed]
   *                 target:
   *                   type: integer
   *                 courseId:
   *                   type: integer
   *             example:
   *               id: 1
   *               name: "Complete 5 lessons"
   *               description: "Finish any 5 lessons."
   *               type: "lessons_completed"
   *               target: 5
   *               courseId: 2
   */
  public async createAchievement(
    req: Request<
      any,
      CreateAchievementResponseDto,
      CreateAchievementRequestDto
    >,
    res: Response<CreateAchievementResponseDto>,
  ): Promise<Response<CreateAchievementResponseDto>> {
    const result = await adminAchievementService.createAchievement(req.body);
    return res.status(201).json(result);
  }

  /**
   * @swagger
   * /api/admin/achievements/{achievementId}:
   *   put:
   *     tags: [Achievements]
   *     summary: Update an achievement
   *     parameters:
   *       - in: path
   *         name: achievementId
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
   *               description:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [lessons_completed, chapters_completed, course_completed]
   *               target:
   *                 type: integer
   *               courseId:
   *                 type: integer
   *           example:
   *             name: "Complete 10 lessons"
   *             description: "Finish any 10 lessons."
   *             type: "lessons_completed"
   *             target: 10
   *     responses:
   *       200:
   *         description: Achievement updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 description:
   *                   type: string
   *                 type:
   *                   type: string
   *                   enum: [lessons_completed, chapters_completed, course_completed]
   *                 target:
   *                   type: integer
   *                 courseId:
   *                   type: integer
   *             example:
   *               id: 1
   *               name: "Complete 10 lessons"
   *               description: "Finish any 10 lessons."
   *               type: "lessons_completed"
   *               target: 10
   *               courseId: 2
   */
  public async updateAchievement(
    req: Request<
      AchievementIdRequestDto,
      UpdateAchievementResponseDto,
      UpdateAchievementRequestDto
    >,
    res: Response<UpdateAchievementResponseDto>,
  ): Promise<Response<UpdateAchievementResponseDto>> {
    const result = await adminAchievementService.updateAchievement(
      req.params.achievementId,
      req.body,
    );
    return res.json(result);
  }

  /**
   * @swagger
   * /api/admin/achievements/{achievementId}:
   *   delete:
   *     tags: [Achievements]
   *     summary: Delete an achievement
   *     parameters:
   *       - in: path
   *         name: achievementId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       204:
   *         description: Achievement deleted
   */
  public async deleteAchievement(
    req: Request<AchievementIdRequestDto>,
    res: Response<void>,
  ): Promise<Response<void>> {
    await adminAchievementService.deleteAchievement(req.params.achievementId);
    return res.status(204).send();
  }

  /**
   * @swagger
   * /api/admin/achievements/{achievementId}:
   *   get:
   *     tags: [Achievements]
   *     summary: Get an achievement by ID
   *     parameters:
   *       - in: path
   *         name: achievementId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       200:
   *         description: Achievement found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   *                 description:
   *                   type: string
   *                 type:
   *                   type: string
   *                   enum: [lessons_completed, chapters_completed, course_completed]
   *                 target:
   *                   type: integer
   *                 courseId:
   *                   type: integer
   *             example:
   *               id: 1
   *               name: "Complete 5 lessons"
   *               description: "Finish any 5 lessons."
   *               type: "lessons_completed"
   *               target: 5
   *               courseId: 2
   */
  public async getAchievement(
    req: Request<AchievementIdRequestDto, CreateAchievementResponseDto>,
    res: Response<CreateAchievementResponseDto>,
  ): Promise<Response<CreateAchievementResponseDto>> {
    const result = await adminAchievementService.getAchievementById(
      req.params.achievementId,
    );
    return res.json(result);
  }

  /**
   * @swagger
   * /api/admin/achievements:
   *   get:
   *     tags: [Achievements]
   *     summary: Get all achievements
   *     responses:
   *       200:
   *         description: List of achievements
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 achievements:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   *                       description:
   *                         type: string
   *                       type:
   *                         type: string
   *                         enum: [lessons_completed, chapters_completed, course_completed]
   *                       target:
   *                         type: integer
   *                       courseId:
   *                         type: integer
   *                   example:
   *                     - id: 1
   *                       name: "Complete 5 lessons"
   *                       description: "Finish any 5 lessons."
   *                       type: "lessons_completed"
   *                       target: 5
   *                       courseId: 2
   *                     - id: 2
   *                       name: "Finish a course"
   *                       description: "Complete all chapters in a course."
   *                       type: "course_completed"
   *                       target: 1
   *                       courseId: 3
   */
  public async getAllAchievements(
    req: Request<any, AchievementsResponseDto>,
    res: Response<AchievementsResponseDto>,
  ): Promise<Response<AchievementsResponseDto>> {
    const result = await adminAchievementService.getAllAchievements();
    return res.json(result);
  }
}

export const adminAchievementController = new AdminAchievementController();
