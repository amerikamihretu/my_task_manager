import { ZodError } from "zod";

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) req.params = parsed.params;

      if (parsed.query !== undefined) {
        try {
          req.query = parsed.query;
        } catch {
          // Express may define req.query as a getter-only property.
          // Since our schemas do not transform query values, using the
          // original req.query is safe and equivalent.
        }
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join(".") || "root",
          message: issue.message,
        }));
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }
      next(error);
    }
  };
}
