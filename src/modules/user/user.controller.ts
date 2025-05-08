import { Request, Response } from 'express';

import {
  CreateUserRequestDto,
  CreateUserResponseDto,
  UpdateUserRequestDto,
  UpdateUserResponseDto,
  UserIdRequestDto,
  GetUserResponseDto,
  GetAllUsersResponseDto,
} from './dtos';
import { userService } from './user.service';

export class UserController {
  /**
   * @swagger
   * /api/users:
   *   post:
   *     tags: [User]
   *     summary: Create a new user
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
   *             required:
   *               - name
   *     responses:
   *       201:
   *         description: User created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   */
  public async createUser(
    req: Request<any, CreateUserResponseDto, CreateUserRequestDto>,
    res: Response<CreateUserResponseDto>,
  ): Promise<Response<CreateUserResponseDto>> {
    const user = await userService.createUser(req.body);
    return res.status(201).json({
      id: user.id,
      name: user.name,
    });
  }

  /**
   * @swagger
   * /api/users/{userId}:
   *   put:
   *     tags: [User]
   *     summary: Update a user
   *     parameters:
   *       - in: path
   *         name: userId
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
   *             required:
   *               - name
   *     responses:
   *       200:
   *         description: User updated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   */
  public async updateUser(
    req: Request<UserIdRequestDto, UpdateUserResponseDto, UpdateUserRequestDto>,
    res: Response<UpdateUserResponseDto>,
  ): Promise<Response<UpdateUserResponseDto>> {
    const user = await userService.updateUser(req.params.userId, req.body);
    return res.json({
      id: user.id,
      name: user.name,
    });
  }

  /**
   * @swagger
   * /api/users/{userId}:
   *   delete:
   *     tags: [User]
   *     summary: Delete a user
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: User deleted
   */
  public async deleteUser(
    req: Request<UserIdRequestDto>,
    res: Response<void>,
  ): Promise<Response<void>> {
    await userService.deleteUser(req.params.userId);
    return res.status(204).send();
  }

  /**
   * @swagger
   * /api/users/{userId}:
   *   get:
   *     tags: [User]
   *     summary: Get a user by ID
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: User found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 id:
   *                   type: integer
   *                 name:
   *                   type: string
   */
  public async getUser(
    req: Request<UserIdRequestDto, GetUserResponseDto>,
    res: Response<GetUserResponseDto>,
  ): Promise<Response<GetUserResponseDto>> {
    const user = await userService.getUserById(req.params.userId);
    return res.json({
      id: user.id,
      name: user.name,
    });
  }

  /**
   * @swagger
   * /api/users:
   *   get:
   *     tags: [User]
   *     summary: Get all users
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 users:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   */
  public async getAllUsers(
    req: Request<any, GetAllUsersResponseDto>,
    res: Response<GetAllUsersResponseDto>,
  ): Promise<Response<GetAllUsersResponseDto>> {
    const users = await userService.getAllUsers();
    return res.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name,
      })),
    });
  }
}

export const userController = new UserController();
