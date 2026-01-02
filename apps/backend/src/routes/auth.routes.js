import express from 'express';
import asyncHandler from '../lib/AsyncHandler.js';
import { login, logout } from '../controllers/auth.controller.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';
import { loginSchema } from '../validators/auth.schema.js';

const router = express.Router();

router.post('/login', validate(loginSchema), asyncHandler(login));
router.post('/logout', AuthMiddleware, asyncHandler(logout));

export default router;
