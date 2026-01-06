import { Router } from 'express';
import asyncHandler from '../lib/AsyncHandler.js';
import { AuthMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/zod-validate.js';

import {
  createUser,
  findAllUsers,
  findUser,
  updateUser,
  getAllDescendants,
} from '../controllers/user.controller.js';

import {
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from '../validators/user.schema.js';
import upload from '../middleware/multer.middleware.js';

const router = Router();

router.use(AuthMiddleware);

router.post('/', validate(createUserSchema), asyncHandler(createUser));

router.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  asyncHandler(findAllUsers),
);

router.get(
  '/:id',
  validate({ params: userIdParamSchema }),
  asyncHandler(findUser),
);

router.put(
  '/:id',
  upload.single('profilePicture'),
  validate({ body: updateUserSchema, params: userIdParamSchema }),
  asyncHandler(updateUser),
);

router.get(
  '/:id/descendants',
  validate({ params: userIdParamSchema }),
  asyncHandler(getAllDescendants),
);

export default router;
