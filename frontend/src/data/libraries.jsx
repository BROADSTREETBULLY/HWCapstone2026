import { apiFetch } from "./api";

export async function getLibraries() {
  return apiFetch("/api/libraries");
}

export async function createLibrary({ name, description }) {
  return apiFetch("/api/libraries", {
    method: "POST",
    body: description ? { name, description } : { name },
  });
}

export async function updateLibrary(id, fields) {
  return apiFetch(`/api/libraries/${id}`, { method: "PUT", body: fields });
}

export async function deleteLibrary(id) {
  return apiFetch(`/api/libraries/${id}`, { method: "DELETE" });
}

export async function getLibraryItems(libraryId) {
  return apiFetch(`/api/libraries/${libraryId}/items`);
}

export async function addLibraryItem(libraryId, { optionID, sortOrder }) {
  const body = { optionID };
  if (sortOrder !== undefined) body.sortOrder = sortOrder;
  return apiFetch(`/api/libraries/${libraryId}/items`, {
    method: "POST",
    body,
  });
}

export async function removeLibraryItem(libraryItemId) {
  return apiFetch(`/api/libraries/items/${libraryItemId}`, {
    method: "DELETE",
  });
}
