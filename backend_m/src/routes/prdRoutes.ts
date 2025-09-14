import { Router } from "express";
import { PRDController } from "../controllers/PRDController.js";

const router = Router({ mergeParams: true });

// PRD endpoints for a given project
router.get("/", PRDController.get);
router.post("/", PRDController.create);
router.put("/", PRDController.update);
router.delete("/", PRDController.remove);

export default router;
