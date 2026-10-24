import { z } from "zod";

const status = z.enum(["pending", "in-progress", "completed"], {
  errorMap: () => ({
    message: "Status must be pending, in-progress, or completed",
  }),
});

const priority = z.enum(["low", "medium", "high"], {
  errorMap: () => ({ message: "Priority must be low, medium, or high" }),
});

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid task id");

const dueDate = z.union([z.coerce.date(), z.null()]).optional();
const tags = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Tags cannot be empty")
      .max(30, "Tags cannot exceed 30 characters"),
  )
  .max(10, "You can add up to 10 tags")
  .optional();
const subtasks = z
  .array(
    z.object({
      title: z.string().trim().min(1).max(200),
      completed: z.boolean().optional(),
    }),
  )
  .max(20, "You can add up to 20 subtasks")
  .optional();
const archived = z.boolean().optional();

export const listTasksSchema = z.object({
  query: z
    .object({
      status: status.optional(),
      priority: priority.optional(),
      tag: z.string().trim().min(1).max(30).optional(),
    })
    .optional()
    .default({}),
});

export const taskIdParamSchema = z.object({
  params: z.object({ id: objectId }),
});

export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Title is required" })
      .trim()
      .min(1, "Title is required")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    status: status.optional(),
    priority: priority.optional(),
    dueDate,
    tags,
    subtasks,
    archived: archived,
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .max(2000, "Description cannot exceed 2000 characters")
        .optional(),
      status: status.optional(),
      priority: priority.optional(),
      dueDate,
      tags,
      subtasks,
      archived: archived,
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "Provide at least one field to update",
    }),
});
