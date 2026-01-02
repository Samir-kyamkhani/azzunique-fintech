import { Router } from 'express';
import {
  createServerDetail,
  updateServerDetail,
  deleteServerDetail,
  changeServerDetailStatus,
  getServerDetails,
  getServerDetailById,
} from '../controllers/serverDetail.controller.js';
import { validate } from '../middleware/zod-validate.js';
import {
  createServerDetailSchema,
  updateServerDetailSchema,
  serverDetailStatusSchema,
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

// SOFT DELETE
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteServerDetail),
);

// STATUS CHANGE
router.patch(
  '/:id/status',
  validate({ params: idParamSchema, body: serverDetailStatusSchema }),
  asyncHandler(changeServerDetailStatus),
);

export default router;
