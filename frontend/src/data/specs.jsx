import { apiFetch, getUser } from "./api";

function supplierFromVersionInternal(version) {
  const fromAttr = (version?.attributes ?? []).find((a) =>
    /^supplier$/i.test(a.key ?? ""),
  );
  return fromAttr?.value ?? "";
}

async function enrichSpec(doc) {
  let options = [];
  try {
    options = await apiFetch(`/api/specs/${doc._id}/options`);
  } catch { }
  const active = options.find((o) => !o.isRedundant && o.currentVersionID) ?? options[0];
  const version =
    active && typeof active.currentVersionID === "object"
      ? active.currentVersionID
      : null;

  return {
    id: doc._id,
    category: doc.category ?? "",
    subCategory: doc.subCategory ?? "",
    desc: version?.productName ?? "",
    spec: version?.rawText ?? "",
    image: version?.imageKey ?? "",
    comment: version?.internalComments ?? "",
    rev: version?.versionNumber ?? "",
    revisedOn: version?.createdAt ?? doc.updatedAt ?? null,
    code: "",
    supplier: supplierFromVersionInternal(version),
    optionId: active?._id ?? null, 
    optionCount: options.length,
    _raw: doc,
  };
}

const enrichAll = (docs) => Promise.all((docs ?? []).map(enrichSpec));


const SPEC_FIELDS = new Set(["category", "subCategory", "createdAt", "updatedAt"]);

export async function queryLibrary({ paginationModel, filterModel, sortModel }) {
  const serverFilter = {
    items: (filterModel?.items ?? []).filter((f) => SPEC_FIELDS.has(f.field)),
  };
  const clientFilters = (filterModel?.items ?? []).filter(
    (f) => !SPEC_FIELDS.has(f.field) && f.value != null && f.value !== "",
  );
  const serverSort = (sortModel ?? []).filter((s) => SPEC_FIELDS.has(s.field));

  const data = await apiFetch("/api/specs/query", {
    method: "POST",
    body: { paginationModel, filterModel: serverFilter, sortModel: serverSort },
  });

  let items = await enrichAll(data.items);


  for (const f of clientFilters) {
    const needle = String(f.value).toLowerCase();
    items = items.filter((row) =>
      String(row[f.field] ?? "").toLowerCase().includes(needle),
    );
  }

  return { items, itemCount: data.itemCount ?? 0 };
}

export const getAll = queryLibrary;
export const getMany = queryLibrary;


let searchCache = { at: 0, items: [] };
const SEARCH_CACHE_MS = 60_000;

export async function searchLibrary(query) {
  if (!query) return [];
  if (Date.now() - searchCache.at > SEARCH_CACHE_MS) {
    const data = await apiFetch("/api/specs/query", {
      method: "POST",
      body: {
        paginationModel: { page: 0, pageSize: 1000 },
        filterModel: { items: [] },
        sortModel: [],
      },
    });
    searchCache = { at: Date.now(), items: await enrichAll(data.items) };
  }
  const needle = query.toLowerCase();
  return searchCache.items
    .filter(
      (row) =>
        row.desc.toLowerCase().includes(needle) ||
        row.spec.toLowerCase().includes(needle) ||
        row.category.toLowerCase().includes(needle) ||
        row.subCategory.toLowerCase().includes(needle),
    )
    .slice(0, 10);
}

export function invalidateSearchCache() {
  searchCache = { at: 0, items: [] };
}



export async function getOne(specId) {
  const doc = await apiFetch(`/api/specs/${specId}`);
  return enrichSpec(doc);
}


export async function createOne(formValues) {
  const user = getUser();
  const spec = await apiFetch("/api/specs", {
    method: "POST",
    body: {
      orgId: user?.orgId,
      ownerType: "library",
      category: formValues.category,
      subCategory: formValues.subCategory,
    },
  });
  invalidateSearchCache();
  const option = await apiFetch(`/api/specs/${spec._id}/options`, {
    method: "POST",
    body: {},
  });
  await apiFetch(`/api/specs/options/${option._id}/versions`, {
    method: "POST",
    body: {
      productName: formValues.desc,
      rawText: formValues.spec || " ", 
      imageKey: formValues.image || undefined,
      internalComments: formValues.comment || undefined,
    },
  });
  return spec;
}


export async function updateOne(specId, formValues) {
  await apiFetch(`/api/specs/${specId}`, {
    method: "PUT",
    body: { category: formValues.category, subCategory: formValues.subCategory },
  });

  if (formValues.desc || formValues.spec) {
    const options = await apiFetch(`/api/specs/${specId}/options`);
    const active =
      options.find((o) => !o.isRedundant && o.currentVersionID) ?? options[0];
    if (active) {
      await createVersion(active._id, {
        productName: formValues.desc,
        rawText: formValues.spec || " ", 
        imageKey: formValues.image || undefined,
        internalComments: formValues.comment || undefined,
      });
    }
  }
}

export async function deleteOne(specId) {
  invalidateSearchCache();
  return apiFetch(`/api/specs/${specId}`, { method: "DELETE" });
}



export async function getOptions(specId) {
  return apiFetch(`/api/specs/${specId}/options`);
}

export async function createOption(specId) {
  return apiFetch(`/api/specs/${specId}/options`, { method: "POST", body: {} });
}

export async function getVersions(optionId) {
  return apiFetch(`/api/specs/options/${optionId}/versions`); 
}


export async function createVersion(optionId, { rawText, productName, imageKey, internalComments, attributes }) {
  return apiFetch(`/api/specs/options/${optionId}/versions`, {
    method: "POST",
    body: { rawText, productName, imageKey, internalComments, attributes },
  });
}


export async function pushToLibrary(optionId) {
  return apiFetch(`/api/specs/options/${optionId}/push-to-library`, {
    method: "POST",
  });
}



export function supplierFromVersion(version) {
  const fromAttr = (version?.attributes ?? []).find((a) =>
    /^supplier$/i.test(a.key ?? ""),
  );
  return fromAttr?.value ?? "";
}

export function upsertSupplierLine(rawText, supplier) {
  const lines = (rawText ?? "").split(/\r?\n/).filter(
    (line) => !/^\s*supplier\s*:/i.test(line),
  );
  if (supplier) lines.push(`Supplier: ${supplier}`);
  return lines.join("\n") || " ";
}

export function validate(formValues) {
  const issues = [];
  if (!formValues?.desc) {
    issues.push({ path: ["desc"], message: "Description is required" });
  }
  if (!formValues?.spec) {
    issues.push({ path: ["spec"], message: "Specification text is required" });
  }
  return { issues };
}

export async function updateSpecFields(specId, { category, subCategory }) {
  return apiFetch(`/api/specs/${specId}`, {
    method: "PUT",
    body: { category, subCategory },
  });
}
