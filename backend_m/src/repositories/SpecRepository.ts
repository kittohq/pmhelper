import { get, run } from "../config/database.js";
import type { CreateSpecDTO, Spec, UpdateSpecDTO } from "../types/index.js";

export class SpecRepository {
  private static async projectExists(projectId: number): Promise<boolean> {
    const row = await get<{ id: number }>(`SELECT id FROM projects WHERE id = ?`, [projectId]);
    return !!row;
  }

  static async getByProjectId(projectId: number): Promise<Spec | undefined> {
    const row = await get<Spec>(`SELECT * FROM specs WHERE project_id = ?`, [projectId]);
    return row;
  }

  static async createForProject(projectId: number, dto: CreateSpecDTO): Promise<Spec> {
    const exists = await this.projectExists(projectId);
    if (!exists) {
      throw Object.assign(new Error("Project not found"), { status: 404 });
    }

    const { title, content = null, technical_details = null, status = "draft" } = dto;
    await run(
      `INSERT INTO specs (project_id, title, content, technical_details, status) VALUES (?, ?, ?, ?, ?)`,
      [projectId, title, content, technical_details, status]
    );

    const created = await this.getByProjectId(projectId);
    if (!created) {
      throw new Error("Failed to fetch created Spec");
    }
    return created;
  }

  static async updateForProject(projectId: number, dto: UpdateSpecDTO): Promise<Spec | undefined> {
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
    if (dto.technical_details !== undefined) {
      fields.push("technical_details = ?");
      params.push(dto.technical_details);
    }
    if (dto.status !== undefined) {
      fields.push("status = ?");
      params.push(dto.status);
    }

    // Always update timestamp
    fields.push(`updated_at = datetime('now')`);

    if (fields.length) {
      await run(`UPDATE specs SET ${fields.join(", ")} WHERE project_id = ?`, [...params, projectId]);
    }

    return this.getByProjectId(projectId);
  }

  static async deleteForProject(projectId: number): Promise<boolean> {
    const res = await run(`DELETE FROM specs WHERE project_id = ?`, [projectId]);
    return res.changes > 0;
  }
}
