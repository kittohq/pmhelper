import { all, get, run } from "../config/database.js";
import type { CreateProjectDTO, Project, UpdateProjectDTO } from "../types/index.js";
import { logger } from "../utils/logger.js";

export class ProjectRepository {
  static async getAll(): Promise<Project[]> {
    const query = `SELECT * FROM projects ORDER BY created_at DESC`;
    logger.db(query);
    const rows = await all<Project>(query);
    logger.db(`Query completed`, [], { rows: rows.length });
    return rows;
  }

  static async getById(id: number): Promise<Project | undefined> {
    const query = `SELECT * FROM projects WHERE id = ?`;
    const params = [id];
    logger.db(query, params);
    const row = await get<Project>(query, params);
    logger.db(`Query completed`, params, { rows: row ? 1 : 0 });
    return row;
  }

  static async create(dto: CreateProjectDTO): Promise<Project> {
    const { name, description = null } = dto;
    const query = `INSERT INTO projects (name, description) VALUES (?, ?)`;
    const params = [name, description];
    logger.db(query, params);
    const result = await run(query, params);
    logger.db(`Insert completed`, params, { changes: result.changes });
    
    const created = await this.getById(result.lastID);
    if (!created) {
      logger.error("Failed to fetch created project", { lastID: result.lastID });
      throw new Error("Failed to fetch created project");
    }
    logger.success(`Project created: ${created.name} (ID: ${created.id})`);
    return created;
  }

  static async update(id: number, dto: UpdateProjectDTO): Promise<Project | undefined> {
    // Build dynamic update
    const fields: string[] = [];
    const params: any[] = [];

    if (dto.name !== undefined) {
      fields.push("name = ?");
      params.push(dto.name);
    }
    if (dto.description !== undefined) {
      fields.push("description = ?");
      params.push(dto.description);
    }

    // Always update timestamp
    fields.push(`updated_at = datetime('now')`);

    if (fields.length > 1) { // More than just timestamp
      const query = `UPDATE projects SET ${fields.join(", ")} WHERE id = ?`;
      const allParams = [...params, id];
      logger.db(query, allParams);
      const result = await run(query, allParams);
      logger.db(`Update completed`, allParams, { changes: result.changes });
    }

    const updated = await this.getById(id);
    if (updated) {
      logger.success(`Project updated: ${updated.name} (ID: ${updated.id})`);
    }
    return updated;
  }

  static async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM projects WHERE id = ?`;
    const params = [id];
    logger.db(query, params);
    const res = await run(query, params);
    logger.db(`Delete completed`, params, { changes: res.changes });
    
    if (res.changes > 0) {
      logger.success(`Project deleted (ID: ${id})`);
    } else {
      logger.warn(`No project found to delete (ID: ${id})`);
    }
    return res.changes > 0;
  }
}
