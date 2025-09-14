import { Request, Response, NextFunction } from "express";
import { ProjectRepository } from "../repositories/ProjectRepository.js";

export const ProjectController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectRepository.getAll();
      res.json(projects);
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const project = await ProjectRepository.getById(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body || {};
      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Field 'name' is required" });
      }
      const created = await ProjectRepository.create({ name, description });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const { name, description } = req.body || {};
      const updated = await ProjectRepository.update(id, { name, description });
      if (!updated) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        return res.status(400).json({ error: "Invalid project id" });
      }
      const ok = await ProjectRepository.delete(id);
      if (!ok) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
