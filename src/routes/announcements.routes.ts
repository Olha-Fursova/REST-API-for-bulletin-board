import express from "express";
import * as announcementsController from "../controllers/announcements.controller.ts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.ts";
import {
  CreateAnnouncementSchema,
  UpdateAnnouncementSchema,
  AnnouncementParamsSchema,
  GetAnnouncementQuerySchema,
} from "../validators/announcements.validator.ts";
import authenticate from "../middleware/authenticate.ts";

const router = express.Router();

router.get(
  "/",
  validateQuery(GetAnnouncementQuerySchema),
  announcementsController.getAllAnnouncements,
);

router.get(
  "/:id",
  validateParams(AnnouncementParamsSchema),
  announcementsController.getAnnouncementById,
);

router.post(
  "/",
  authenticate,
  validateBody(CreateAnnouncementSchema),
  announcementsController.createAnnouncement,
);

router.patch(
  "/:id",
  authenticate,
  validateParams(AnnouncementParamsSchema),
  validateBody(UpdateAnnouncementSchema),
  announcementsController.updateAnnouncement,
);

router.delete(
  "/:id",
  authenticate,
  validateParams(AnnouncementParamsSchema),
  announcementsController.deleteAnnouncement,
);

export default router;
