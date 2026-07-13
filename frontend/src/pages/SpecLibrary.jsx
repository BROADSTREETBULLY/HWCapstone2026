import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import { DataGrid, GridActionsCellItem, gridClasses } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import { useDialogs } from "../hooks/useDialogs/useDialogs";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { deleteOne as deleteSpec, getAll as getSpecs, createOne } from "../data/specs";
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

  const handleRowClick = React.useCallback(
    ({ row }) => {
      navigate(`/dashboard/specs/${row.id}`);
    },
    [navigate],
  );


  const handleRowEdit = React.useCallback(
    (Spec) => () => {
      navigate(`${Spec.id}/edit`);
    },
    [navigate],
  );

  const handleRowDelete = React.useCallback(
    (Spec) => async () => {
      const confirmed = await dialogs.confirm(
        `Do you wish to delete ${Spec.code}?`,
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
          await deleteSpec(Number(Spec.id));

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
      columnVisibilityModel: { code: false, revisedOn: false, rev: false},
          }
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
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>
            {value}
          </div>
        ),
      },
      {
        field: "category",
        headerName: "Category",
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
            key="edit-item"
            icon={<EditIcon />}
            label="Edit"
            onClick={handleRowEdit(row)}
          />,
          <GridActionsCellItem
            key="delete-item"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleRowDelete(row)}
          />,
        ],
      },
    ],
    [handleRowEdit, handleRowDelete],
  );

  const pageTitle = "Furniture Library";

  return (
    <PageContainer
      title={pageTitle} >
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
            onRowClick={handleRowClick}
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
    </PageContainer>
  );
}

