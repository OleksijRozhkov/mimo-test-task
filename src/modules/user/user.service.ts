import { eq } from 'drizzle-orm';

import { db } from '../../db';
import { UserEntity } from '../../db/schema/user.schema';
import { User } from '../../db/schema/user.schema';
import { NotFoundError } from '../../utils/errors/app-error';

import { CreateUserRequestDto, UpdateUserRequestDto } from './dtos';

export class UserService {
  public async createUser(createUserDto: CreateUserRequestDto): Promise<User> {
    const [user] = await db
      .insert(UserEntity)
      .values({
        name: createUserDto.name,
      })
      .returning();
    return user;
  }

  public async updateUser(
    id: number,
    updateUserDto: UpdateUserRequestDto,
  ): Promise<User> {
    const [updatedUser] = await db
      .update(UserEntity)
      .set({ name: updateUserDto.name })
      .where(eq(UserEntity.id, id))
      .returning();

    if (!updatedUser) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  public async deleteUser(id: number): Promise<void> {
    const result = await db.delete(UserEntity).where(eq(UserEntity.id, id));
    if (result.changes === 0) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }

  public async getUserById(id: number): Promise<User> {
    const [user] = await db
      .select()
      .from(UserEntity)
      .where(eq(UserEntity.id, id));
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
    return user;
  }

  public async getAllUsers(): Promise<User[]> {
    return await db.select().from(UserEntity);
  }

  public async verifyUserExists(id: number): Promise<void> {
    const [user] = await db
      .select()
      .from(UserEntity)
      .where(eq(UserEntity.id, id));
    if (!user) {
      throw new NotFoundError(`User with ID ${id} not found`);
    }
  }
}

export const userService = new UserService();
