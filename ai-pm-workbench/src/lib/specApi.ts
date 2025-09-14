import { api } from "./api";
import type {
  BackendSpec,
  CreateSpecDTO,
  UpdateSpecDTO,
} from "./types";

export const specApi = {
  get: (projectId: number) => api.get<BackendSpec>(`/projects/${projectId}/spec`),
  create: (projectId: number, data: CreateSpecDTO) =>
    api.post<BackendSpec>(`/projects/${projectId}/spec`, data),
  update: (projectId: number, data: UpdateSpecDTO) =>
    api.put<BackendSpec>(`/projects/${projectId}/spec`, data),
  delete: (projectId: number) => api.delete<void>(`/projects/${projectId}/spec`),
};
