import { z } from "zod";

export const planTasksSchema = z.object({
  body: z.object({
    prompt: z
      .string({ required_error: "Describe what you want to plan" })
      .trim()
      .min(3, "Describe what you want to plan")
      .max(2000, "Your planning request cannot exceed 2000 characters"),
    tasks: z
      .array(
        z.object({
          title: z.string().trim().max(200).optional(),
          description: z.string().trim().max(2000).optional(),
          status: z.enum(["pending", "in-progress", "completed"]).optional(),
          priority: z.enum(["low", "medium", "high"]).optional(),
          dueDate: z.union([z.string(), z.null()]).optional(),
          tags: z.array(z.string().trim().max(30)).max(10).optional(),
          subtasks: z
            .array(
              z.object({
                title: z.string().trim().max(200),
                completed: z.boolean().optional(),
              }),
            )
            .max(20)
            .optional(),
        }),
      )
      .max(100)
      .optional()
      .default([]),
  }),
});
