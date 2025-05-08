import { Request, Response } from 'express';

import { UserIdRequestDto } from '../user/dtos';

import { GetAchievementsResponseDto } from './dtos';
import { userAchievementService } from './user-achievement.service';

export class UserAchievementController {
  /**
   * @swagger
   * /api/achievements:
   *   get:
   *     tags: [Achievements]
   *     summary: Get user achievements
   *     parameters:
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *           minimum: 1
   *     responses:
   *       200:
   *         description: List of user achievements
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
   *                       completed:
   *                         type: boolean
   *                       progress:
   *                         type: number
   *                   example:
   *                     - id: 1
   *                       name: "Complete 5 lessons"
   *                       description: "Finish any 5 lessons."
   *                       completed: false
   *                       progress: 3
   *                     - id: 2
   *                       name: "Finish a course"
   *                       description: "Complete all chapters in a course."
   *                       completed: true
   *                       progress: 1
   */
  public async getUserAchievements(
    req: Request<any, GetAchievementsResponseDto, any, UserIdRequestDto>,
    res: Response<GetAchievementsResponseDto>,
  ): Promise<Response<GetAchievementsResponseDto>> {
    const result = await userAchievementService.getUserAchievements(
      req.query.userId,
    );
    return res.json(result);
  }
}

export const userAchievementController = new UserAchievementController();
