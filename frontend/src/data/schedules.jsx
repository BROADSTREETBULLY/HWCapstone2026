
import { apiFetch } from "./api";

export async function createSchedule({ projectID, scheduleType, scheduleTitle }) {
  return apiFetch("/api/schedules", {
    method: "POST",
    body: scheduleTitle
      ? { projectID, scheduleType, scheduleTitle }
      : { projectID, scheduleType },
  });
}

export async function getSchedules(projectID) {
  return apiFetch(
    projectID
      ? `/api/schedules?projectID=${encodeURIComponent(projectID)}`
      : "/api/schedules",
  );
}

export async function getSchedule(id) {
  return apiFetch(`/api/schedules/${id}`);
}

export async function updateSchedule(id, fields) {
  return apiFetch(`/api/schedules/${id}`, { method: "PUT", body: fields });
}

export async function deleteSchedule(id) {
  return apiFetch(`/api/schedules/${id}`, { method: "DELETE" });
}

export async function getItems(scheduleId) {
  return apiFetch(`/api/schedules/${scheduleId}/items`);
}


export async function createItem(scheduleId, fields) {
  return apiFetch(`/api/schedules/${scheduleId}/items`, {
    method: "POST",
    body: fields,
  });
}


export async function addFromLibrary(scheduleId, { optionID, itemCode, sortOrder }) {
  const body = { optionID };
  if (itemCode !== undefined) body.itemCode = itemCode;
  if (sortOrder !== undefined) body.sortOrder = sortOrder;
  return apiFetch(`/api/schedules/${scheduleId}/items/from-library`, {
    method: "POST",
    body,
  });
}


export async function updateItem(itemId, fields) {
  return apiFetch(`/api/schedules/items/${itemId}`, {
    method: "PUT",
    body: fields,
  });
}

export async function deleteItem(itemId) {
  return apiFetch(`/api/schedules/items/${itemId}`, { method: "DELETE" });
}
