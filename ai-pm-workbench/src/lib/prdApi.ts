import { api } from "./api";
import type {
  BackendPRD,
  CreatePRDDTO,
  UpdatePRDDTO,
} from "./types";

export const prdApi = {
  get: (projectId: number) => api.get<BackendPRD>(`/projects/${projectId}/prd`),
  create: (projectId: number, data: CreatePRDDTO) =>
    api.post<BackendPRD>(`/projects/${projectId}/prd`, data),
  update: (projectId: number, data: UpdatePRDDTO) =>
    api.put<BackendPRD>(`/projects/${projectId}/prd`, data),
  delete: (projectId: number) => api.delete<void>(`/projects/${projectId}/prd`),
};
