const API_URL = '/api/specs';


export async function searchLibrary(query) {
  if (!query) return [];
  const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

export async function getMany({ paginationModel, filterModel, sortModel }) {
  const params = new URLSearchParams({
    paginationModel: JSON.stringify(paginationModel),
    filterModel: JSON.stringify(filterModel),
    sortModel: JSON.stringify(sortModel),
  });

  const response = await fetch(`${API_URL}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch specs');
  return response.json();
}

export async function getAll({ paginationModel, filterModel, sortModel }) {
  const params = new URLSearchParams({
    paginationModel: JSON.stringify(paginationModel),
    filterModel: JSON.stringify(filterModel),
    sortModel: JSON.stringify(sortModel),
  });

  const response = await fetch(`${API_URL}/library?${params}`);
  if (!response.ok) throw new Error('Failed to fetch library');
  return response.json();
}


export async function getOne(SpecId) {
  const response = await fetch(`${API_URL}/${SpecId}`);
  if (!response.ok) throw new Error('Spec not found');
  return response.json();
}


export async function createOne(data) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create spec');
  return response.json();
}

export async function updateOne(SpecId, data) {
  const response = await fetch(`${API_URL}/${SpecId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update spec');
  return response.json();
}

export async function deleteOne(SpecId) {
  const response = await fetch(`${API_URL}/${SpecId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete spec');
}

export function validate(Spec) {
  let issues = [];

  if (!Spec.code) {
    issues = [...issues, { message: 'Code is required', path: ['code'] }];
  }

  if (!Spec.desc) {
    issues = [...issues, { message: 'Description is required', path: ['desc'] }];
  }

  if (!Spec.supplier) {
    issues = [...issues, { message: 'Supplier is required', path: ['supplier'] }];
  }

  return { issues };
}
