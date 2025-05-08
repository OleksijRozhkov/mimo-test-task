import { Request, Response } from 'express';

import { courseService } from './course.service';
import {
  CreateCourseRequestDto,
  CreateCourseResponseDto,
  UpdateCourseRequestDto,
  UpdateCourseResponseDto,
  CourseIdRequestDto,
  GetCourseResponseDto,
  GetAllCoursesResponseDto,
} from './dtos';

export class CourseController {
  /**
   * @swagger
   * /api/courses:
   *   post:
   *     tags: [Courses]
   *     summary: Create a new course
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
   *         description: Course created
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
  public async createCourse(
    req: Request<any, CreateCourseResponseDto, CreateCourseRequestDto>,
    res: Response<CreateCourseResponseDto>,
  ): Promise<Response<CreateCourseResponseDto>> {
    const course = await courseService.createCourse(req.body);
    return res.status(201).json({
      id: course.id,
      name: course.name,
    });
  }

  /**
   * @swagger
   * /api/courses/{courseId}:
   *   put:
   *     tags: [Courses]
   *     summary: Update a course
   *     parameters:
   *       - in: path
   *         name: courseId
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
   *         description: Course updated
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
  public async updateCourse(
    req: Request<
      CourseIdRequestDto,
      UpdateCourseResponseDto,
      UpdateCourseRequestDto
    >,
    res: Response<UpdateCourseResponseDto>,
  ): Promise<Response<UpdateCourseResponseDto>> {
    const course = await courseService.updateCourse(
      req.params.courseId,
      req.body,
    );
    return res.json({
      id: course.id,
      name: course.name,
    });
  }

  /**
   * @swagger
   * /api/courses/{courseId}:
   *   delete:
   *     tags: [Courses]
   *     summary: Delete a course
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Course deleted
   */
  public async deleteCourse(
    req: Request<CourseIdRequestDto>,
    res: Response<void>,
  ): Promise<Response<void>> {
    await courseService.deleteCourse(req.params.courseId);
    return res.status(204).send();
  }

  /**
   * @swagger
   * /api/courses/{courseId}:
   *   get:
   *     tags: [Courses]
   *     summary: Get a course by ID
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Course found
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
  public async getCourse(
    req: Request<CourseIdRequestDto, GetCourseResponseDto>,
    res: Response<GetCourseResponseDto>,
  ): Promise<Response<GetCourseResponseDto>> {
    const course = await courseService.getCourseById(req.params.courseId);
    return res.json({
      id: course.id,
      name: course.name,
    });
  }

  /**
   * @swagger
   * /api/courses:
   *   get:
   *     tags: [Courses]
   *     summary: Get all courses
   *     responses:
   *       200:
   *         description: List of courses
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 courses:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       name:
   *                         type: string
   */
  public async getAllCourses(
    req: Request<any, GetAllCoursesResponseDto>,
    res: Response<GetAllCoursesResponseDto>,
  ): Promise<Response<GetAllCoursesResponseDto>> {
    const courses = await courseService.getAllCourses();
    return res.json({
      courses: courses.map((course) => ({
        id: course.id,
        name: course.name,
      })),
    });
  }
}

export const courseController = new CourseController();
