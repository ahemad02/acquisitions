import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { eq } from 'drizzle-orm';

export const hashPassword = async passsword => {
  try {
    return await bcrypt.hash(passsword, 10);
  } catch (error) {
    logger.error('Error hashing password:', error);
    throw new Error('Failed to hash password', error);
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    logger.error('Error comparing password:', error);
    throw new Error('Failed to compare password', error);
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!existingUser) {
      throw new Error('User not found', 404);
    }

    const isPasswordValid = await comparePassword(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      throw new Error('Invalid password', 401);
    }

    return existingUser;
  } catch (error) {
    logger.error('Error authenticating user:', error);
    throw error;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists', 400);
    }

    const password_hash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: password_hash,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    logger.info('User created successfully:${email}');

    return newUser;
  } catch (error) {
    logger.error('Error creating user:', error);
    throw new Error('Failed to create user', error);
  }
};
