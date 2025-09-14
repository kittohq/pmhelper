// Backend entities (mirror Express + SQLite backend)

export interface BackendTimestamps {
  created_at: string;
  updated_at: string;
}

export interface BackendProject extends BackendTimestamps {
  id: number;
  name: string;
  description?: string | null;
}

export type DocStatus = "draft" | "review" | "approved";

export interface BackendPRD extends BackendTimestamps {
  id: number;
  project_id: number;
  title: string;
  content?: string | null;
  status: DocStatus;
}

export interface BackendSpec extends BackendTimestamps {
  id: number;
  project_id: number;
  title: string;
  content?: string | null;
  technical_details?: string | null;
  status: DocStatus;
}

// DTOs
export interface CreateProjectDTO {
  name: string;
  description?: string | null;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string | null;
}

export interface CreatePRDDTO {
  title: string;
  content?: string | null;
  status?: DocStatus;
}

export interface UpdatePRDDTO {
  title?: string;
  content?: string | null;
  status?: DocStatus;
}

export interface CreateSpecDTO {
  title: string;
  content?: string | null;
  technical_details?: string | null;
  status?: DocStatus;
}

export interface UpdateSpecDTO {
  title?: string;
  content?: string | null;
  technical_details?: string | null;
  status?: DocStatus;
}
