import { z } from "zod";
import { registry } from "../openapi.ts";

export const AnnouncementParamsSchema = registry.register(
  "AnnouncementsParams",
  z.object({
    id: z.coerce.number().int().positive(),
  }),
);

export const CreateAnnouncementSchema = registry.register(
  "CreateAnnouncement",
  z.object({
    title: z.string().min(5).max(50),
    description: z.string().min(10),
    price: z.number().positive(),
    category: z.enum(["sale", "service", "job", "other"]),
  }),
);

export const UpdateAnnouncementSchema = registry.register(
  "UpdateAnnouncement",
  CreateAnnouncementSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    {
      error: "At least one field must be provided",
    },
  ),
);

export const GetAnnouncementQuerySchema = registry.register(
  "GetAnnouncementQuery",
  z.object({
    search: z.string().min(1).max(100).optional(),
    sort: z.enum(["newest", "oldest"]).optional(),
    page: z.coerce.number().int().positive().optional(),
  }),
);

export type AnnouncementParams = z.infer<typeof AnnouncementParamsSchema>;
export type CreateAnnouncementBody = z.infer<typeof CreateAnnouncementSchema>;
export type UpdateAnnouncementBody = z.infer<typeof UpdateAnnouncementSchema>;
export type GetAnnouncementQuery = z.infer<typeof GetAnnouncementQuerySchema>;

registry.registerPath({
  method: "get",
  path: "/api/announcements",
  tags: ["Announcements"],
  summary: "Get all announcements with pagination, filtering and sorting",
  request: {
    query: GetAnnouncementQuerySchema,
  },
  responses: {
    200: { description: "List of announcements with pagination metadata" },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/announcements/{id}",
  tags: ["Announcements"],
  summary: "Get announcement by ID",
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    200: { description: "Announcement retrieved successfully" },
    404: { description: "Announcement not found" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/announcements",
  tags: ["Announcements"],
  summary: "Create new announcement",
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": { schema: CreateAnnouncementSchema },
      },
    },
  },
  responses: {
    201: { description: "Announcement created successfully" },
    401: { description: "Authentication required" },
    422: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "patch",
  path: "/api/announcements/{id}",
  tags: ["Announcements"],
  summary: "Update announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
    body: {
      content: {
        "application/json": { schema: UpdateAnnouncementSchema },
      },
    },
  },
  responses: {
    200: { description: "Announcement updated successfully" },
    401: { description: "Authentication required" },
    403: { description: "Forbidden" },
    404: { description: "Announcement not found" },
    422: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "delete",
  path: "/api/announcements/{id}",
  tags: ["Announcements"],
  summary: "Delete announcement",
  security: [{ bearerAuth: [] }],
  request: {
    params: AnnouncementParamsSchema,
  },
  responses: {
    204: { description: "Announcement deleted successfully" },
    401: { description: "Authentication required" },
    403: { description: "Forbidden" },
    404: { description: "Announcement not found" },
  },
});
