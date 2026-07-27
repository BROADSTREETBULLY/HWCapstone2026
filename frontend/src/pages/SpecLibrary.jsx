import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridActionsCellItem, gridClasses } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs/useDialogs";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  deleteOne as deleteSpec,
  getAll as getSpecs,
  createOne,
  createVersion,
  updateSpecFields,
  upsertSupplierLine,
} from "../data/specs";
import MultilineEditCell from "../components/MultilineEditCell";
import ImageEditCell from "../components/ImageEditCell";
import SpecRowDialogs from "../components/SpecRowDialogs";
import HistoryIcon from "@mui/icons-material/History";
import LayersIcon from "@mui/icons-material/Layers";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAdd";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import PageContainer from "../components/PageContainer";

const INITIAL_PAGE_SIZE = 10;

export default function SpecLibrary() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const dialogs = useDialogs();
  const notifications = useNotifications();

  const [paginationModel, setPaginationModel] = React.useState({
    page: searchParams.get("page") ? Number(searchParams.get("page")) : 0,
    pageSize: searchParams.get("pageSize")
      ? Number(searchParams.get("pageSize"))
      : INITIAL_PAGE_SIZE,
  });
  const [filterModel, setFilterModel] = React.useState(
    searchParams.get("filter")
      ? JSON.parse(searchParams.get("filter") ?? "")
      : { items: [] },
  );
  const [sortModel, setSortModel] = React.useState(
    searchParams.get("sort") ? JSON.parse(searchParams.get("sort") ?? "") : [],
  );

  const [rowsState, setRowsState] = React.useState({
    rows: [],
    rowCount: 0,
  });

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const handlePaginationModelChange = React.useCallback(
    (model) => {
      setPaginationModel(model);

      searchParams.set("page", String(model.page));
      searchParams.set("pageSize", String(model.pageSize));

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleFilterModelChange = React.useCallback(
    (model) => {
      setFilterModel(model);

      if (
        model.items.length > 0 ||
        (model.quickFilterValues && model.quickFilterValues.length > 0)
      ) {
        searchParams.set("filter", JSON.stringify(model));
      } else {
        searchParams.delete("filter");
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const handleSortModelChange = React.useCallback(
    (model) => {
      setSortModel(model);

      if (model.length > 0) {
        searchParams.set("sort", JSON.stringify(model));
      } else {
        searchParams.delete("sort");
      }

      const newSearchParamsString = searchParams.toString();

      navigate(
        `${pathname}${newSearchParamsString ? "?" : ""}${newSearchParamsString}`,
      );
    },
    [navigate, pathname, searchParams],
  );

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const listData = await getSpecs({
        paginationModel,
        sortModel,
        filterModel,
      });

      setRowsState({
        rows: listData.items,
        rowCount: listData.itemCount,
      });
    } catch (listDataError) {
      setError(listDataError);
    }

    setIsLoading(false);
  }, [paginationModel, sortModel, filterModel]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = React.useCallback(() => {
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, loadData]);

  const handleNewSpec = React.useCallback(async () => {
    try {
      await createOne({ category: "", subCategory: "", desc: "", spec: "" });
      notifications.show("Blank spec added — double-click the row to fill it in.", {
        severity: "success",
        autoHideDuration: 4000,
      });
      loadData();
    } catch (createError) {
      notifications.show(`Failed to create spec. Reason: ${createError.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  }, [notifications, loadData]);


  const processRowUpdate = React.useCallback(async (newRow, oldRow) => {
    if (newRow.category !== oldRow.category) {
      await updateSpecFields(newRow.id, { category: newRow.category });
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
      return { ...newRow, spec: version.rawText, rev: version.versionNumber, revisedOn: version.createdAt };
    }
    return newRow;
  }, []);

  const handleProcessRowUpdateError = React.useCallback(
    (updateError) => {
      notifications.show(`Failed to save changes. Reason: ${updateError.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
    [notifications],
  );

  const [dialogState, setDialogState] = React.useState(null);
  const openRowDialog = React.useCallback(
    (mode, row) => () => setDialogState({ mode, row }),
    [],
  );

  const handleRowDelete = React.useCallback(
    (Spec) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${Spec.desc || "this spec"}?`,
        {
          title: `Delete Spec?`,
          severity: "error",
          okText: "Delete",
          cancelText: "Cancel",
        },
      );

      if (confirmed) {
        setIsLoading(true);
        try {
          await deleteSpec(Spec.id);

          notifications.show("Spec deleted successfully.", {
            severity: "success",
            autoHideDuration: 3000,
          });
          loadData();
        } catch (deleteError) {
          notifications.show(
            `Failed to delete Spec. Reason:' ${deleteError.message}`,
            {
              severity: "error",
              autoHideDuration: 3000,
            },
          );
        }
        setIsLoading(false);
      }
    },
    [dialogs, notifications, loadData],
  );

  const initialState = React.useMemo(
    () => ({
      pagination: { paginationModel: { pageSize: INITIAL_PAGE_SIZE } },
      columns: {
        columnVisibilityModel: { id: false, code: false, revisedOn: false, rev: false },
      },
    }),
    [],
  );

  const columns = React.useMemo(
    () => [
      { field: "id", headerName: "ID", width: 70 },
      {
        field: "code",
        headerName: "Code",
        width: 70,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "desc",
        headerName: "Description",
        width: 110,
        editable: true,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "spec",
        headerName: "Specification",
        width: 450,
        editable: true,
        renderEditCell: (params) => <MultilineEditCell {...params} />,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "supplier",
        headerName: "Supplier",
        width: 250,
        editable: true,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
        editable: true,
        type: "singleSelect",
        valueOptions: [
          "Chair",
          "Table",
          "Workstation",
          "Lounge",
          "Storage",
          "Mirror",
        ],
        width: 100,
      },
      {
        field: "image",
        headerName: "Image",
        width: 150,
        editable: true,
        renderEditCell: (params) => <ImageEditCell {...params} />,
        renderCell: ({ value }) =>
          value ? (
            <img
              src={value}
              alt="spec"
              style={{ width: 150, height: 150, objectFit: "contain" }}
            />
          ) : null,
      },
      {
        field: "comment",
        headerName: "Comment",
        width: 200,
        editable: true,
        renderEditCell: (params) => <MultilineEditCell {...params} />,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "rev",
        headerName: "REV",
        width: 70,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "revisedOn",
        headerName: "Date",
        type: "date",
        valueGetter: (value) => value && new Date(value),
        width: 100,
      },

      {
        field: "actions",
        type: "actions",
        flex: 1,
        align: "right",
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="versions"
            icon={<HistoryIcon />}
            label="Previous versions"
            title="Previous versions"
            onClick={openRowDialog("versions", row)}
          />,
          <GridActionsCellItem
            key="options"
            icon={<LayersIcon />}
            label="Options"
            title="Options"
            onClick={openRowDialog("options", row)}
          />,
          <GridActionsCellItem
            key="add-to-library"
            icon={<BookmarkAddIcon />}
            label="Add to my library"
            title="Add to my library"
            onClick={openRowDialog("addToLibrary", row)}
          />,
          <GridActionsCellItem
            key="add-to-schedule"
            icon={<PlaylistAddIcon />}
            label="Add to schedule"
            title="Add to schedule"
            onClick={openRowDialog("addToSchedule", row)}
          />,
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
    [handleRowDelete, openRowDialog],
  );

  const pageTitle = "Furniture Library";

  return (
    <PageContainer
      title={pageTitle}
      actions={
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewSpec}>
            New Spec
          </Button>
          <Tooltip title="Reload">
            <Button variant="outlined" onClick={handleRefresh}>
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <Box sx={{ flex: 1, width: "100%" }}>
        {error ? (
          <Box sx={{ flexGrow: 1 }}>
            <Alert severity="error">{error.message}</Alert>
          </Box>
        ) : (
          <DataGrid
            rows={rowsState.rows}
            getRowHeight={() => "auto"}
            rowCount={rowsState.rowCount}
            columns={columns}
            pagination
            sortingMode="server"
            filterMode="server"
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={handleSortModelChange}
            filterModel={filterModel}
            onFilterModelChange={handleFilterModelChange}
            disableRowSelectionOnClick
            editMode="row"
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            loading={isLoading}
            initialState={initialState}
            showToolbar
            pageSizeOptions={[5, INITIAL_PAGE_SIZE, 25]}
            sx={{
              [`& .${gridClasses.columnHeader}, & .${gridClasses.cell}`]: {
                outline: "transparent",
              },
              [`& .${gridClasses.columnHeader}:focus-within, & .${gridClasses.cell}:focus-within`]:
                {
                  outline: "none",
                },
              [`& .${gridClasses.cell}`]: {
                whiteSpace: "normal",
                wordWrap: "break-word",
              },
            }}
            slotProps={{
              loadingOverlay: {
                variant: "circular-progress",
                noRowsVariant: "circular-progress",
              },
              baseIconButton: {
                size: "small",
              },
            }}
          />
        )}
      </Box>
      <SpecRowDialogs
        mode={dialogState?.mode}
        row={dialogState?.row}
        onClose={() => setDialogState(null)}
      />
    </PageContainer>
  );
}
