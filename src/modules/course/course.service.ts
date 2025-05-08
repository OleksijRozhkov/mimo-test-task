import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { CourseEntity, type Course } from '../../db/schema';
import { NotFoundError } from '../../utils/errors/app-error';

import { CreateCourseRequestDto, UpdateCourseRequestDto } from './dtos';

export class CourseService {
  public async createCourse(
    createCourseDto: CreateCourseRequestDto,
  ): Promise<Course> {
    const [course] = await db
      .insert(CourseEntity)
      .values({
        name: createCourseDto.name,
      })
      .returning();
    return course;
  }

  public async updateCourse(
    id: number,
    updateCourseDto: UpdateCourseRequestDto,
  ): Promise<Course> {
    const [updatedCourse] = await db
      .update(CourseEntity)
      .set({ name: updateCourseDto.name })
      .where(eq(CourseEntity.id, id))
      .returning();

    if (!updatedCourse) {
      throw new NotFoundError(`Course with ID ${id} not found`);
    }

    return updatedCourse;
  }

  public async deleteCourse(id: number): Promise<void> {
    const result = await db.delete(CourseEntity).where(eq(CourseEntity.id, id));
    if (result.changes === 0) {
      throw new NotFoundError(`Course with ID ${id} not found`);
    }
  }

  public async getCourseById(id: number): Promise<Course> {
    const [course] = await db
      .select()
      .from(CourseEntity)
      .where(eq(CourseEntity.id, id));
    if (!course) {
      throw new NotFoundError(`Course with ID ${id} not found`);
    }
    return course;
  }

  public async getAllCourses(): Promise<Course[]> {
    return await db.select().from(CourseEntity);
  }

  public async verifyCourseExists(courseId: number): Promise<void> {
    const [course] = await db
      .select()
      .from(CourseEntity)
      .where(eq(CourseEntity.id, courseId));
    if (!course) {
      throw new NotFoundError(`Course with ID ${courseId} not found`);
    }
  }
}

export const courseService = new CourseService();
