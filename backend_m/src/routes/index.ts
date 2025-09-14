import { Router } from "express";
import projectRoutes from "./projectRoutes.js";
import prdRoutes from "./prdRoutes.js";
import specRoutes from "./specRoutes.js";

const router = Router();

// Projects CRUD
router.use("/projects", projectRoutes);

// One-to-one nested resources under a project
router.use("/projects/:projectId/prd", prdRoutes);
router.use("/projects/:projectId/spec", specRoutes);

export default router;
