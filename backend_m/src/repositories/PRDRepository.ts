import { all, get, run } from "../config/database.js";
import type { CreatePRDDTO, PRD, UpdatePRDDTO } from "../types/index.js";

export class PRDRepository {
  private static async projectExists(projectId: number): Promise<boolean> {
    const row = await get<{ id: number }>(`SELECT id FROM projects WHERE id = ?`, [projectId]);
    return !!row;
  }

  static async getByProjectId(projectId: number): Promise<PRD | undefined> {
    const row = await get<PRD>(`SELECT * FROM prds WHERE project_id = ?`, [projectId]);
    return row;
  }

  static async createForProject(projectId: number, dto: CreatePRDDTO): Promise<PRD> {
    const exists = await this.projectExists(projectId);
    if (!exists) {
      throw Object.assign(new Error("Project not found"), { status: 404 });
    }

    const { title, content = null, status = "draft" } = dto;
    await run(
      `INSERT INTO prds (project_id, title, content, status) VALUES (?, ?, ?, ?)`,
      [projectId, title, content, status]
    );

    const created = await this.getByProjectId(projectId);
    if (!created) {
      throw new Error("Failed to fetch created PRD");
    }
    return created;
  }

  static async updateForProject(projectId: number, dto: UpdatePRDDTO): Promise<PRD | undefined> {
    const exists = await this.projectExists(projectId);
    if (!exists) {
      throw Object.assign(new Error("Project not found"), { status: 404 });
    }

    const fields: string[] = [];
    const params: any[] = [];

    if (dto.title !== undefined) {
      fields.push("title = ?");
      params.push(dto.title);
    }
    if (dto.content !== undefined) {
      fields.push("content = ?");
      params.push(dto.content);
    }
    if (dto.status !== undefined) {
      fields.push("status = ?");
      params.push(dto.status);
    }

    // Always update timestamp
    fields.push(`updated_at = datetime('now')`);

    if (fields.length) {
      await run(`UPDATE prds SET ${fields.join(", ")} WHERE project_id = ?`, [...params, projectId]);
    }

    return this.getByProjectId(projectId);
  }

  static async deleteForProject(projectId: number): Promise<boolean> {
    const res = await run(`DELETE FROM prds WHERE project_id = ?`, [projectId]);
    return res.changes > 0;
  }
}
