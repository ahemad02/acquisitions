import logger from '#config/logger.js';
import { createUser, authenticateUser } from '#services/auth.service.js';
import { formatValidationError } from '#utils/format.js';
import { signupSchema, signInSchema } from '#validations/auth.validation.js';
import { jwttoken } from '#utils/jwt.js';
import { cookies } from '#utils/cookies.js';

export const signup = async (req, res, next) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      res
        .status(400)
        .json({ error: formatValidationError(validationResult.error) });
      return;
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User signed up successfully:${email}`);

    res.status(201).json({
      message: 'User signed up successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error signing up user:', error);

    if (error.message === 'User with this email already exists') {
      res.status(409).json({ error: 'Email already exists' });
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      res
        .status(400)
        .json({ error: formatValidationError(validationResult.error) });
      return;
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser({ email, password });

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User signed in successfully: ${email}`);

    res.status(200).json({
      message: 'User signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error('Error signing in user:', error);

    if (
      error.message === 'User not found' ||
      error.message === 'Invalid password'
    ) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    cookies.clear(res, 'token');

    logger.info('User signed out successfully');

    res.status(200).json({ message: 'User signed out successfully' });
  } catch (error) {
    logger.error('Error signing out user:', error);
    next(error);
  }
};
