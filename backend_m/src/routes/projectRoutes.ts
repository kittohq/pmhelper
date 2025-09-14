import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController.js";

const router = Router();

// Projects CRUD
router.get("/", ProjectController.list);
router.get("/:id", ProjectController.get);
router.post("/", ProjectController.create);
router.put("/:id", ProjectController.update);
router.delete("/:id", ProjectController.remove);

export default router;
