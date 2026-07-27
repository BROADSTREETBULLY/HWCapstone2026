export const CATEGORIES = ["Furniture", "FF&E", "Finishes"];

export const SUBCATEGORIES = {
  "Furniture": ["Chair", "Table", "Sofa", "Storage", "Hardware", "Misc"],
  "FF&E": ["Plumbing Fixtures", "Specialty Equipment", "Appliances", "Lighting", "Misc"],
  "Finishes": [
    "Timber Flooring", "Vinyl Flooring", "Carpet", "Paint",
    "Applied Wall Finishes", "Laminate", "Timber", "Fabric", "Tile", "Misc",
  ],
};


export const CATEGORY_SLUGS = {
  furniture: "Furniture",
  ffe: "FF&E",
  finishes: "Finishes",
};


export const gridBorderSx = {
  border: "1px solid #000",
  borderRadius: 0,
  "& .MuiDataGrid-cell": {
    borderRight: "1px solid #000",
    borderTop: "1px solid #000",
    py: 0.5,
    alignItems: "center",
  },
  "& .MuiDataGrid-columnHeaders": { borderBottom: "1px solid #000" },
  "& .MuiDataGrid-columnHeader": { borderRight: "1px solid #000" },
  "& .MuiDataGrid-footerContainer": { borderTop: "1px solid #000" },
};


export const multilineEnterGuard =
  (fields) =>
  (params, event) => {
    if (
      params.cellMode === "edit" &&
      event.key === "Enter" &&
      fields.includes(params.field)
    ) {
      event.defaultMuiPrevented = true;
    }
  };
