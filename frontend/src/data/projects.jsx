import { apiFetch } from "./api";

export async function getProjects() {
  return apiFetch("/api/projects"); 
}

export async function getProject(id) {
  return apiFetch(`/api/projects/${id}`);
}

export async function createProject(fields) {

  return apiFetch("/api/projects", { method: "POST", body: fields });
}

export async function updateProject(id, fields) {
  return apiFetch(`/api/projects/${id}`, { method: "PUT", body: fields });
}

export async function deleteProject(id) {
  return apiFetch(`/api/projects/${id}`, { method: "DELETE" });
}
