import {
  fetchAllUsers,
  fetchUserById,
  modifyUser,
  removeUser,
} from '#controllers/users.controller.js';
import { authenticateToken, requireRole } from '#middleware/auth.middleware.js';
import express from 'express';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['admin']), fetchAllUsers);

router.get('/:id', authenticateToken, fetchUserById);

router.patch('/:id', authenticateToken, modifyUser);

router.delete('/:id', authenticateToken, requireRole(['admin']), removeUser);

export default router;
