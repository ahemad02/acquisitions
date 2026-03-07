import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      })
      .from(users);
  } catch (error) {
    logger.error('Error getting users:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const getUserById = async id => {
  try {
    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id));

    if (!user.length) {
      throw new Error('User not found', 404);
    }

    return user[0];
  } catch (error) {
    logger.error('Error getting user by id:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const updateUser = async (id, updates) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.id, id));

    if (!existingUser.length) {
      throw new Error('User not found', 404);
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        created_at: users.createdAt,
        updated_at: users.updatedAt,
      });

    return updatedUser[0];
  } catch (error) {
    logger.error('Error updating user:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

export const deleteUser = async id => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.id, id));

    if (!existingUser.length) {
      throw new Error('User not found', 404);
    }

    await db.delete(users).where(eq(users.id, id));

    return true;
  } catch (error) {
    logger.error('Error deleting user:', {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
