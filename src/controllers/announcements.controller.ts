import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { Prisma } from "../../prisma/generated/prisma/client.ts";
import type {
  AnnouncementParams,
  CreateAnnouncementBody,
  UpdateAnnouncementBody,
  GetAnnouncementQuery,
} from "../validators/announcements.validator.ts";
import createHttpError from "http-errors";

// Get all Aannouncements ==============================================================

export const getAllAnnouncements = async (
  req: Request,
  res: Response<any, { query: GetAnnouncementQuery }>,
) => {
  const { page = 1, sort = "newest", search } = res.locals.query;

  const perPage = 10;
  const skip = (page - 1) * perPage;
  const take = perPage;

  const where: Prisma.AnnouncementWhereInput = {};

  if (search) {
    where.title = {
      contains: search,
      mode: "insensitive",
    };
  }

  const [announcements, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take,
      orderBy: {
        createdAt: sort === "oldest" ? "asc" : "desc",
      },
      include: {
        user: { select: { id: true, username: true, email: true, name: true } },
      },
    }),
    prisma.announcement.count({ where }),
  ]);

  res.status(200).json({
    data: announcements,
    pagination: {
      total,
      page,
      totalPages: Math.ceil(total / perPage),
      perPage,
    },
  });
};

// Get announcement by id ==============================================================

export const getAnnouncementById = async (
  req: Request<AnnouncementParams>,
  res: Response,
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, username: true, email: true, name: true } },
    },
  });

  if (!announcement) {
    return res.status(404).json({ error: "Announcement not found" });
  }

  res.status(200).json(announcement);
};

// Create announcement ==============================================================

export const createAnnouncement = async (
  req: Request<{}, {}, CreateAnnouncementBody>,
  res: Response,
) => {
  const { title, description, price, category } = req.body;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      description,
      price,
      category,
      user: {
        connect: { id: Number(req.user!.sub) },
      },
    },
    include: {
      user: { select: { id: true, username: true, email: true, name: true } },
    },
  });

  res.status(201).json(announcement);
};

// Update announcement ==============================================================

export const updateAnnouncement = async (
  req: Request<AnnouncementParams, {}, UpdateAnnouncementBody>,
  res: Response,
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw createHttpError(404, "Announcement not found");
  }

  if (announcement.userId !== Number(req.user!.sub)) {
    throw createHttpError(403, "Access denied");
  }

  const { title, description, price, category } = req.body;

  const updateData: Prisma.AnnouncementUpdateInput = {
    title,
    description,
    price,
    category,
  };

  const updated = await prisma.announcement.update({
    where: { id },
    data: updateData,
    include: {
      user: { select: { id: true, username: true, email: true, name: true } },
    },
  });

  res.status(200).json(updated);
};

// Delete announcement ==============================================================

export const deleteAnnouncement = async (
  req: Request<AnnouncementParams>,
  res: Response,
) => {
  const { id } = req.params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    throw createHttpError(404, "Announcement not found");
  }

  if (announcement.userId !== Number(req.user!.sub)) {
    throw createHttpError(403, "Access denied");
  }

  await prisma.announcement.delete({
    where: { id },
  });

  res.status(204).end();
};
