import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { planTasksSchema } from "../validators/aiValidators.js";
import { planTasks } from "../controllers/aiController.js";

const router = Router();

router.use(requireAuth);
router.post("/plan", validate(planTasksSchema), planTasks);

export default router;
