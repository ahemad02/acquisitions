import logger from '#config/logger.js';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#services/users.services.js';

import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validation.js';

import bcrypt from 'bcrypt';

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting all users...');

    const users = await getAllUsers();

    res.status(200).json({
      users,
      message: 'Users fetched successfully',
      count: users.length,
    });
  } catch (error) {
    logger.error('Error getting users:', error);
    next(error);
  }
};

export const fetchUserById = async (req, res, next) => {
  try {
    const { id } = userIdSchema.parse(req.params);

    logger.info(`Getting user with id ${id}`);

    const user = await getUserById(id);

    res.status(200).json({
      user,
      message: 'User fetched successfully',
    });
  } catch (error) {
    logger.error('Error fetching user:', error);
    next(error);
  }
};

export const modifyUser = async (req, res, next) => {
  try {
    const { id } = userIdSchema.parse(req.params);
    const updates = updateUserSchema.parse(req.body);

    const authUser = req.user;

    if (authUser.id !== id && authUser.role !== 'admin') {
      return res.status(403).json({
        message: 'You can only update your own profile',
      });
    }

    if (updates.role && authUser.role !== 'admin') {
      return res.status(403).json({
        message: 'Only admin can update roles',
      });
    }

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    logger.info(`Updating user ${id}`);

    const user = await updateUser(id, updates);

    res.status(200).json({
      user,
      message: 'User updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    next(error);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const { id } = userIdSchema.parse(req.params);

    const authUser = req.user;

    if (authUser.id !== id && authUser.role !== 'admin') {
      return res.status(403).json({
        message: 'You cannot delete another user',
      });
    }

    logger.info(`Deleting user ${id}`);

    await deleteUser(id);

    res.status(200).json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting user:', error);
    next(error);
  }
};
