import { Request, Response, NextFunction } from "express";
import { SpecRepository } from "../repositories/SpecRepository.js";

export const SpecController = {
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      if (Number.isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const spec = await SpecRepository.getByProjectId(projectId);
      if (!spec) {
        return res.status(404).json({ error: "Spec not found for this project" });
      }
      res.json(spec);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      if (Number.isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const { title, content, technical_details, status } = req.body || {};
      if (!title || typeof title !== "string") {
        return res.status(400).json({ error: "Field 'title' is required" });
      }
      try {
        const created = await SpecRepository.createForProject(projectId, {
          title,
          content,
          technical_details,
          status,
        });
        res.status(201).json(created);
      } catch (e: any) {
        if (typeof e?.message === "string" && e.message.includes("UNIQUE constraint failed")) {
          return res.status(409).json({ error: "Spec already exists for this project" });
        }
        if (e?.status === 404) {
          return res.status(404).json({ error: "Project not found" });
        }
        throw e;
      }
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      if (Number.isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const { title, content, technical_details, status } = req.body || {};
      try {
        const updated = await SpecRepository.updateForProject(projectId, {
          title,
          content,
          technical_details,
          status,
        });
        if (!updated) {
          return res.status(404).json({ error: "Spec not found for this project" });
        }
        res.json(updated);
      } catch (e: any) {
        if (e?.status === 404) {
          return res.status(404).json({ error: "Project not found" });
        }
        throw e;
      }
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = Number(req.params.projectId);
      if (Number.isNaN(projectId)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const ok = await SpecRepository.deleteForProject(projectId);
      if (!ok) {
        return res.status(404).json({ error: "Spec not found for this project" });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
