import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import { useParams } from "react-router-dom";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  queryLibrary,
  createOne,
  deleteOne as deleteSpec,
  createVersion,
  updateSpecFields,
  upsertSupplierLine,
} from "../data/specs";
import { CATEGORY_SLUGS, SUBCATEGORIES, gridBorderSx, multilineEnterGuard } from "../data/taxonomy";
import MultilineEditCell from "../components/MultilineEditCell";
import ImageEditCell from "../components/ImageEditCell";
import SpecRowDialogs from "../components/SpecRowDialogs";
import PageContainer from "../components/PageContainer";

export default function CategoryLibrary() {
  const { categorySlug } = useParams();
  const category = CATEGORY_SLUGS[categorySlug] ?? "Furniture";
  const subCategories = SUBCATEGORIES[category];
  const notifications = useNotifications();

  // rows = everything loaded for this category; visibleRows below is what the
  // search box has narrowed it down to
  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [search, setSearch] = React.useState("");
  const [dialogState, setDialogState] = React.useState(null);

  // ids of specs made with New Spec on this page. They get pinned to the top of
  // the grid until you hit Refresh or leave the page - a new row is blank, so
  // any search or any sort would otherwise drop it somewhere you can't find it.
  const [newIds, setNewIds] = React.useState([]);

  // sorting and paging are held here instead of inside the grid, so the pinned
  // rows can be put in front after the sort has been applied
  const [sortModel, setSortModel] = React.useState([
    { field: "subCategory", sort: "asc" },
  ]);
  const [paginationModel, setPaginationModel] = React.useState({
    page: 0,
    pageSize: 25,
  });

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const { items } = await queryLibrary({
        paginationModel: { page: 0, pageSize: 500 },
        filterModel: {
          items: [{ field: "category", value: category, operator: "equals" }],
        },
        sortModel: [{ field: "subCategory", sort: "asc" }],
      });
      setRows(items);
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
  }, [category]);

  React.useEffect(() => {
    setSearch("");
    setNewIds([]);
    loadData();
  }, [loadData]);


  // Refresh also lets go of the pinned rows, so they drop back into normal
  // order once you've finished filling them in.
  const handleRefresh = () => {
    setNewIds([]);
    loadData();
  };


  const visibleRows = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    const pinnedIds = new Set(newIds);

    // newest first, and skipping the search box entirely
    const pinned = newIds
      .map((id) => rows.find((row) => row.id === id))
      .filter(Boolean);

    let rest = rows.filter((row) => !pinnedIds.has(row.id));

    if (needle) {
      rest = rest.filter((row) =>
        [row.desc, row.spec, row.supplier, row.subCategory]
          .join(" ")
          .toLowerCase()
          .includes(needle),
      );
    }

    // the grid is told not to sort (sortingMode="server"), so the sort happens
    // here on everything except the pinned rows
    const sort = sortModel[0];
    if (sort) {
      const direction = sort.sort === "desc" ? -1 : 1;
      rest = [...rest].sort(
        (a, b) =>
          String(a[sort.field] ?? "").localeCompare(
            String(b[sort.field] ?? ""),
            undefined,
            { numeric: true },
          ) * direction,
      );
    }

    return [...pinned, ...rest];
  }, [rows, search, newIds, sortModel]);

  // New Spec makes a blank row straight away - no form. You fill it in by
  // double-clicking the row, same as a spreadsheet.
  const handleNewSpec = async () => {
    try {
      const spec = await createOne({
        category,
        subCategory: "Misc",
        desc: "",
        spec: "",
      });
      setNewIds((ids) => [spec._id, ...ids]);
      setPaginationModel((model) => ({ ...model, page: 0 }));
      loadData();
    } catch (err) {
      notifications.show(`Failed to create spec. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  // Runs when you finish editing a row. Two different saves happen here:
  //  - sub category lives on the spec, so that's a normal update
  //  - the text/image/supplier live on the version, so those changes create a
  //    NEW version instead of overwriting the old one
  const processRowUpdate = React.useCallback(async (newRow, oldRow) => {
    if (newRow.subCategory !== oldRow.subCategory) {
      await updateSpecFields(newRow.id, { subCategory: newRow.subCategory });
    }
    if (
      newRow.desc !== oldRow.desc ||
      newRow.spec !== oldRow.spec ||
      newRow.image !== oldRow.image ||
      newRow.comment !== oldRow.comment ||
      newRow.supplier !== oldRow.supplier
    ) {
      if (!newRow.optionId) throw new Error("Row has no option to version");
      let rawText = newRow.spec || oldRow.spec || " ";
      if (newRow.supplier !== oldRow.supplier) {
        rawText = upsertSupplierLine(rawText, newRow.supplier);
      }
      const version = await createVersion(newRow.optionId, {
        rawText,
        productName: newRow.desc,
        imageKey: newRow.image || undefined,
        internalComments: newRow.comment || undefined,
      });
      return {
        ...newRow,
        spec: version.rawText,
        rev: version.versionNumber,
        revisedOn: version.createdAt,
      };
    }
    return newRow;
  }, []);

  const handleRowDelete = React.useCallback(
    (row) => async () => {
      if (!window.confirm(`Delete "${row.desc || "this spec"}" from the library?`))
        return;
      try {
        await deleteSpec(row.id);
        notifications.show("Spec deleted.", {
          severity: "success",
          autoHideDuration: 3000,
        });
        loadData();
      } catch (err) {
        notifications.show(`Failed to delete spec. Reason: ${err.message}`, {
          severity: "error",
          autoHideDuration: 5000,
        });
      }
    },
    [loadData, notifications],
  );

  const openRowDialog = React.useCallback(
    (mode, row) => () => setDialogState({ mode, row }),
    [],
  );

  const columns = React.useMemo(
    () => [
      { field: "desc", headerName: "Description", width: 200, editable: true },
      {
        field: "spec",
        headerName: "Specification",
        width: 420,
        editable: true,
        renderEditCell: (params) => <MultilineEditCell {...params} />,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>{value}</div>
        ),
      },
      { field: "supplier", headerName: "Supplier", width: 160, editable: true },
      {
        field: "subCategory",
        headerName: "Sub Category",
        width: 160,
        editable: true,
        type: "singleSelect",
        valueOptions: subCategories,
      },
      {
        field: "image",
        headerName: "Image",
        width: 140,
        editable: true,
        renderEditCell: (params) => <ImageEditCell {...params} />,
        renderCell: ({ value }) =>
          value ? (
            <img
              src={value}
              alt=""
              style={{ width: "100%", height: "auto", objectFit: "contain" }}
            />
          ) : null,
      },
      { field: "comment", headerName: "Comment", width: 200, editable: true },
      {
        field: "buttons",
        headerName: "",
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack spacing={0.5} sx={{ py: 0.5, width: "100%" }}>
            <Button size="small" variant="outlined" onClick={openRowDialog("versions", row)}>
              Previous Versions
            </Button>
            <Button size="small" variant="outlined" onClick={openRowDialog("options", row)}>
              Options
            </Button>
            <Button size="small" variant="outlined" onClick={openRowDialog("addToLibrary", row)}>
              Add to Library
            </Button>
            <Button size="small" variant="outlined" onClick={openRowDialog("addToSchedule", row)}>
              Add to Schedule
            </Button>
          </Stack>
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 55,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            title="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [subCategories, openRowDialog, handleRowDelete],
  );

  return (
    <PageContainer
      title={`${category} Library`}
      breadcrumbs={[
        { title: "Dashboard", path: "/dashboard" },
        { title: `${category} Library` },
      ]}
      actions={
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Create a new spec in this library">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewSpec}>
              New Spec
            </Button>
          </Tooltip>
          <Tooltip title="Reload">
            <Button variant="outlined" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <TextField
        fullWidth
        size="small"
        placeholder={`Search the ${category} library`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
        Double-click a row to edit; click elsewhere to save. Content edits are
        kept as new versions — history is never overwritten.
      </Typography>
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Box sx={{ width: "100%", height: "calc(100vh - 330px)", minHeight: 360 }}>
          <DataGrid
            rows={visibleRows}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            editMode="row"
            onCellKeyDown={multilineEnterGuard(["spec"])}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={(err) =>
              notifications.show(`Failed to save changes. Reason: ${err.message}`, {
                severity: "error",
                autoHideDuration: 5000,
              })
            }
            getRowHeight={() => "auto"}
            sx={gridBorderSx}
            sortingMode="server"
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      )}
      <SpecRowDialogs
        mode={dialogState?.mode}
        row={dialogState?.row}
        onClose={() => setDialogState(null)}
        onChanged={loadData}
      />
    </PageContainer>
  );
}
