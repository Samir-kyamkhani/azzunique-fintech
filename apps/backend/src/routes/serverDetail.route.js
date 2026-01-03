import { Router } from 'express';
import {
  createServerDetail,
  updateServerDetail,
  getServerDetails,
  getServerDetailById,
} from '../controllers/serverDetail.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createServerDetailSchema,
  updateServerDetailSchema,
  idParamSchema,
} from '../validators/serverDetail.schema.js';
import asyncHandler from '../lib/AsyncHandler.js';

const router = Router();

// CREATE
router.post(
  '/',
  validate(createServerDetailSchema),
  asyncHandler(createServerDetail),
);

// GET ALL
router.get('/', getServerDetails);

// GET BY ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getServerDetailById),
);

// UPDATE
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateServerDetailSchema }),
  asyncHandler(updateServerDetail),
);


export default router;
