import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  getLibraries,
  createLibrary,
  deleteLibrary,
  getLibraryItems,
  addLibraryItem,
  removeLibraryItem,
} from "../data/libraries";
import {
  createVersion,
  pushToLibrary,
  supplierFromVersion,
  upsertSupplierLine,
} from "../data/specs";
import SpecSearch from "../components/SpecSearch";
import ImageEditCell from "../components/ImageEditCell";
import MultilineEditCell from "../components/MultilineEditCell";
import SpecRowDialogs from "../components/SpecRowDialogs";
import PushToOrgDialog from "../components/PushToOrgDialog";
import { gridBorderSx, multilineEnterGuard } from "../data/taxonomy";
import PageContainer from "../components/PageContainer";

function toRow(item) {
  const option =
    item.optionID && typeof item.optionID === "object" ? item.optionID : null;
  const version =
    option?.currentVersionID && typeof option.currentVersionID === "object"
      ? option.currentVersionID
      : null;
  return {
    id: item._id,
    desc: version?.productName ?? "",
    spec: version?.rawText ?? "",
    supplier: supplierFromVersion(version),
    image: version?.imageKey ?? "",
    comment: version?.internalComments ?? "",
    rev: version?.versionNumber ?? "",
    optionId: option?._id ?? null,
  };
}

export default function LibrariesPage() {
  const notifications = useNotifications();

  const [libraries, setLibraries] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState("");
  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newName, setNewName] = React.useState("");

  const loadLibraries = React.useCallback(async () => {
    setError(null);
    try {
      const data = await getLibraries();
      setLibraries(data);
      setSelectedId((current) => {
        if (current && data.some((l) => l._id === current)) return current;
        return data[0]?._id ?? "";
      });
      if (!data.length) setIsLoading(false);
    } catch (err) {
      setError(err);
      setIsLoading(false);
    }
  }, []);

  const loadItems = React.useCallback(async () => {
    if (!selectedId) {
      setRows([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await getLibraryItems(selectedId);
      setRows(items.map(toRow));
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
  }, [selectedId]);

  React.useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  React.useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreateLibrary = async () => {
    if (!newName.trim()) return;
    try {
      const created = await createLibrary({ name: newName.trim() });
      setDialogOpen(false);
      setNewName("");
      await loadLibraries();
      setSelectedId(created._id);
    } catch (err) {
      notifications.show(`Failed to create library. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleDeleteLibrary = async () => {
    const lib = libraries.find((l) => l._id === selectedId);
    if (!lib) return;
    if (!window.confirm(`Delete library "${lib.name}" and all its items?`)) return;
    try {
      await deleteLibrary(selectedId);
      setSelectedId("");
      loadLibraries();
    } catch (err) {
      notifications.show(`Failed to delete library. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleAddFromOrg = async (spec) => {
    if (!selectedId) {
      notifications.show("Create or select a library first.", {
        severity: "warning",
        autoHideDuration: 4000,
      });
      return;
    }
    if (!spec.optionId) {
      notifications.show("That spec has no option to add yet.", {
        severity: "error",
        autoHideDuration: 4000,
      });
      return;
    }
    try {
      await addLibraryItem(selectedId, {
        optionID: spec.optionId,
        sortOrder: rows.length,
      });
      notifications.show(`"${spec.desc}" added as an editable copy.`, {
        severity: "success",
        autoHideDuration: 3000,
      });
      loadItems();
    } catch (err) {
      notifications.show(`Failed to add spec. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const processRowUpdate = React.useCallback(async (newRow, oldRow) => {
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
      return { ...newRow, spec: version.rawText, rev: version.versionNumber };
    }
    return newRow;
  }, []);


  const [dialogState, setDialogState] = React.useState(null);

  const [pushRow, setPushRow] = React.useState(null);

  const handlePushConfirm = React.useCallback(
    async ({ cleanedText }) => {
      const row = pushRow;
      try {
        const textChanged = cleanedText !== row.spec;
        if (textChanged) {
          await createVersion(row.optionId, {
            rawText: cleanedText || " ",
            productName: row.desc,
            imageKey: row.image || undefined,
          });
        }
        await pushToLibrary(row.optionId);
        if (textChanged) {
          await createVersion(row.optionId, {
            rawText: row.spec || " ",
            productName: row.desc,
            imageKey: row.image || undefined,
          });
        }
        notifications.show("Pushed back to the org library as a new version.", {
          severity: "success",
          autoHideDuration: 4000,
        });
        loadItems();
      } catch (err) {
        notifications.show(
          err.status === 409
            ? "This spec has already been pushed to the org library."
            : `Push failed. Reason: ${err.message}`,
          { severity: "error", autoHideDuration: 5000 },
        );
        throw err;
      }
    },
    [pushRow, loadItems, notifications],
  );

  const columns = React.useMemo(
    () => [
      { field: "desc", headerName: "Product", flex: 1, minWidth: 160, editable: true },
      {
        field: "spec",
        headerName: "Specification",
        flex: 2,
        minWidth: 240,
        editable: true,
        renderEditCell: (params) => <MultilineEditCell {...params} />,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>{value}</div>
        ),
      },
      { field: "supplier", headerName: "Supplier", width: 140, editable: true },
      {
        field: "image",
        headerName: "Image",
        width: 120,
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
      { field: "comment", headerName: "Comment", flex: 1, minWidth: 140, editable: true },
      { field: "rev", headerName: "Rev", width: 60 },
      {
        field: "push",
        headerName: "",
        width: 170,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) => (
          <Stack spacing={0.5} sx={{ py: 0.5, width: "100%" }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setDialogState({ mode: "addToSchedule", row })}
            >
              Add to Schedule
            </Button>
            <Tooltip title="Send your edits back to the org library as a new version">
              <Button size="small" variant="outlined" onClick={() => setPushRow(row)}>
                PUSH TO ORG
              </Button>
            </Tooltip>
          </Stack>
        ),
      },
      {
        field: "actions",
        type: "actions",
        width: 60,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="remove"
            icon={<DeleteIcon />}
            label="Remove"
            onClick={async () => {
              if (!window.confirm("Remove this spec from the library?")) return;
              try {
                await removeLibraryItem(row.id);
                loadItems();
              } catch (err) {
                notifications.show(
                  `Failed to remove item. Reason: ${err.message}`,
                  { severity: "error", autoHideDuration: 5000 },
                );
              }
            }}
          />,
        ],
      },
    ],
    [loadItems, notifications],
  );

  return (
    <PageContainer
      title="My Libraries"
      breadcrumbs={[
        { title: "Dashboard", path: "/dashboard" },
        { title: "My Libraries" },
      ]}
      actions={
        <Stack direction="row" spacing={1} alignItems="center">
          <SpecSearch onAdd={handleAddFromOrg} />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            New Library
          </Button>
          <Tooltip title="Reload">
            <Button variant="outlined" onClick={loadItems}>
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel id="library-select-label">Library</InputLabel>
          <Select
            labelId="library-select-label"
            label="Library"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {libraries.map((lib) => (
              <MenuItem key={lib._id} value={lib._id}>
                {lib.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedId && (
          <Tooltip title="Delete this library">
            <Button color="error" variant="outlined" onClick={handleDeleteLibrary}>
              <DeleteIcon fontSize="small" />
            </Button>
          </Tooltip>
        )}
      </Stack>

      {libraries.length === 0 && !error ? (
        <Typography color="text.secondary">
          No libraries yet — create one, then use the search bar to add specs
          from the org library as editable copies.
        </Typography>
      ) : error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Box sx={{ width: "100%" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mb: 1, display: "block" }}
          >
            These are your editable copies. Double-click a row to edit; edits
            save as new versions. PUSH TO ORG updates the original library spec.
          </Typography>
          <Box sx={{ width: "100%", height: "calc(100vh - 400px)", minHeight: 360 }}>
          <DataGrid
            rows={rows}
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
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
          />
          </Box>
        </Box>
      )}

      <SpecRowDialogs
        mode={dialogState?.mode}
        row={dialogState?.row}
        onClose={() => setDialogState(null)}
      />
      <PushToOrgDialog
        open={Boolean(pushRow)}
        row={pushRow}
        askCategory={false}
        onClose={() => setPushRow(null)}
        onConfirm={handlePushConfirm}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>New Library</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Library name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateLibrary()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateLibrary}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
