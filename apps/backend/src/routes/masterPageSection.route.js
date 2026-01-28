import { Router } from 'express';
import * as controller from '../controllers/masterPageSection.controller.js';
import validate from '../middlewares/validate.js';
import {
  createSectionSchema,
  updateSectionSchema,
  moveSectionSchema,
} from '../validators/masterPageSection.schema.js';

const router = Router();

router.post(
  '/master-pages/:masterPageId/sections',
  validate(createSectionSchema),
  controller.addMasterPageSection,
);

router.get(
  '/master-pages/:masterPageId/sections',
  controller.getMasterPageSections,
);

router.patch(
  '/sections/:id',
  validate(updateSectionSchema),
  controller.updateMasterPageSection,
);

router.patch(
  '/sections/:id/move',
  validate(moveSectionSchema),
  controller.moveMasterPageSection,
);

router.delete('/sections/:id', controller.deleteMasterPageSection);

export default router;
