import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  listTasksSchema,
  createTaskSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from "../validators/taskValidators.js";
import {
  listTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";

const router = Router();

router.use(requireAuth);

router.get("/", validate(listTasksSchema), listTasks);
router.post("/", validate(createTaskSchema), createTask);
router.get("/:id", validate(taskIdParamSchema), getTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", validate(taskIdParamSchema), deleteTask);

export default router;
