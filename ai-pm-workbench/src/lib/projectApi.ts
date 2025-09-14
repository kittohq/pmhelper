import { api } from "./api";
import type {
  BackendProject,
  CreateProjectDTO,
  UpdateProjectDTO,
} from "./types";

export const projectApi = {
  getAll: () => api.get<BackendProject[]>("/projects"),
  getOne: (id: number) => api.get<BackendProject>(`/projects/${id}`),
  create: (data: CreateProjectDTO) => api.post<BackendProject>("/projects", data),
  update: (id: number, data: UpdateProjectDTO) =>
    api.put<BackendProject>(`/projects/${id}`, data),
  delete: (id: number) => api.delete<void>(`/projects/${id}`),
};
