import { Router } from "express";
import { SpecController } from "../controllers/SpecController.js";

const router = Router({ mergeParams: true });

// Spec endpoints for a given project
router.get("/", SpecController.get);
router.post("/", SpecController.create);
router.put("/", SpecController.update);
router.delete("/", SpecController.remove);

export default router;
