import * as React from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  getVersions,
  getOptions,
  createOption,
  createVersion,
  supplierFromVersion,
  upsertSupplierLine,
} from "../data/specs";
import { getLibraries, addLibraryItem } from "../data/libraries";
import { getSchedules, addFromLibrary } from "../data/schedules";
import { getProjects } from "../data/projects";
import { gridBorderSx, multilineEnterGuard } from "../data/taxonomy";
import MultilineEditCell from "./MultilineEditCell";
import ImageEditCell from "./ImageEditCell";

const TITLES = {
  versions: "Previous Versions",
  options: "Options",
  addToLibrary: "Add to My Library",
  addToSchedule: "Add to Schedule",
};

const imageCell = ({ value }) =>
  value ? (
    <img
      src={value}
      alt=""
      style={{ width: "100%", objectFit: "contain", display: "block", padding: "4px 0" }}
    />
  ) : null;

const specCell = ({ value }) => (
  <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>{value}</div>
);

function versionToRow(version, extra = {}) {
  return {
    rev: version?.versionNumber ?? "",
    revisedOn: version?.createdAt ?? null,
    desc: version?.productName ?? "",
    spec: version?.rawText ?? "",
    supplier: supplierFromVersion(version),
    image: version?.imageKey ?? "",
    ...extra,
  };
}


export default function SpecRowDialogs({ mode, row, onClose, onChanged, editableOptions = true, context = null }) {
  const notifications = useNotifications();
  const [rows, setRows] = React.useState(null); 
  const [optionPicker, setOptionPicker] = React.useState(null);

  const activeMode = optionPicker ? optionPicker.pickerMode : mode;
  const activeOptionId = optionPicker ? optionPicker.optionId : row?.optionId;

  const fail = React.useCallback(
    (err) =>
      notifications.show(`Failed. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      }),
    [notifications],
  );

  const handleCloseRef = React.useRef(null);
  const load = React.useCallback(async () => {
    setRows(null);
    try {
      if (activeMode === "versions") {
        const versions = await getVersions(row.optionId); 
        setRows(versions.map((v) => versionToRow(v, { id: v._id })));
      } else if (activeMode === "options") {
        const options = await getOptions(row.id);
        setRows(
          options.map((option, index) => {
            const version =
              typeof option.currentVersionID === "object" ? option.currentVersionID : null;
            return versionToRow(version, {
              id: option._id,
              optionId: option._id,
              label: `Option ${index + 1}${option.isRedundant ? " (redundant)" : ""}`,
            });
          }),
        );
      } else if (activeMode === "addToLibrary") {
        const libraries = await getLibraries();
        setRows(
          libraries.map((lib) => ({
            id: lib._id,
            primary: lib.name,
            secondary: lib.description,
            onPick: async () => {
              await addLibraryItem(lib._id, { optionID: activeOptionId });
              notifications.show(`Added to "${lib.name}" as an editable copy.`, {
                severity: "success",
                autoHideDuration: 3000,
              });
              optionPicker ? setOptionPicker(null) : handleCloseRef.current?.();
            },
          })),
        );
      } else if (activeMode === "addToSchedule") {
        const [schedules, projects] = await Promise.all([
          getSchedules(),
          getProjects().catch(() => []),
        ]);
        const projectName = Object.fromEntries(
          projects.map((p) => [p._id, `${p.projectName} (${p.projectNumber})`]),
        );
        setRows(
          schedules.map((schedule) => ({
            id: schedule._id,
            primary: schedule.scheduleTitle,
            secondary: projectName[schedule.projectID] ?? "",
            onPick: async () => {
              await addFromLibrary(schedule._id, { optionID: activeOptionId });
              notifications.show(`Added to "${schedule.scheduleTitle}".`, {
                severity: "success",
                autoHideDuration: 3000,
              });
              optionPicker ? setOptionPicker(null) : handleCloseRef.current?.();
            },
          })),
        );
      }
    } catch (err) {
      fail(err);
      handleCloseRef.current?.();
    }
  }, [activeMode, activeOptionId, row, optionPicker]); 
  React.useEffect(() => {
    setOptionPicker(null);
  }, [mode, row]);

  React.useEffect(() => {
    if (mode && row) load();
  }, [mode, row, load]);

  const handleClose = React.useCallback(() => {
    setOptionPicker(null);
    onClose();
  }, [onClose]);
  handleCloseRef.current = handleClose;

  const processRowUpdate = React.useCallback(
    async (newRow, oldRow) => {
      if (
        newRow.desc !== oldRow.desc ||
        newRow.spec !== oldRow.spec ||
        newRow.image !== oldRow.image ||
        newRow.supplier !== oldRow.supplier
      ) {
        let rawText = newRow.spec || oldRow.spec || " ";
        if (newRow.supplier !== oldRow.supplier) {
          rawText = upsertSupplierLine(rawText, newRow.supplier);
        }
        const version = await createVersion(newRow.optionId, {
          rawText,
          productName: newRow.desc,
          imageKey: newRow.image || undefined,
        });
        onChanged?.();
        return {
          ...newRow,
          spec: version.rawText,
          rev: version.versionNumber,
          revisedOn: version.createdAt,
        };
      }
      return newRow;
    },
    [onChanged],
  );

  const handleCreateOption = async () => {
    try {
      const option = await createOption(row.id);
      await createVersion(option._id, {
        rawText: row.spec || " ",
        productName: row.desc,
        imageKey: row.image || undefined,
      });
      notifications.show("New option created — double-click it to edit the variant.", {
        severity: "success",
        autoHideDuration: 4000,
      });
      load();
      onChanged?.();
    } catch (err) {
      fail(err);
    }
  };

  const baseColumns = (editable) => [
    { field: "desc", headerName: "Description", width: 170, editable },
    {
      field: "spec",
      headerName: "Specification",
      width: 340,
      editable,
      renderEditCell: (params) => <MultilineEditCell {...params} />,
      renderCell: specCell,
    },
    { field: "supplier", headerName: "Supplier", width: 130, editable },
    {
      field: "image",
      headerName: "Image",
      width: 150,
      editable,
      renderEditCell: (params) => <ImageEditCell {...params} />,
      renderCell: imageCell,
    },
  ];

  const versionColumns = React.useMemo(
    () => [
      { field: "rev", headerName: "Rev", width: 60 },
      {
        field: "revisedOn",
        headerName: "Revised On",
        width: 110,
        valueGetter: (value) => (value ? new Date(value).toLocaleDateString() : ""),
      },
      ...baseColumns(false),
    ],
    [],
  );

  const optionColumns = React.useMemo(
    () => [
      { field: "label", headerName: "", width: 90 },
      ...baseColumns(editableOptions),
      {
        field: "buttons",
        headerName: "",
        width: 160,
        sortable: false,
        filterable: false,
        renderCell: ({ row: optionRow }) =>
          context ? (
            <Stack spacing={0.5} sx={{ py: 0.5, width: "100%" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  try {
                    await context.onAdd(optionRow.optionId);
                    notifications.show("Added.", {
                      severity: "success",
                      autoHideDuration: 3000,
                    });
                    handleClose();
                  } catch (err) {
                    fail(err);
                  }
                }}
              >
                {context.addLabel}
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={async () => {
                  try {
                    await context.onReplace(optionRow.optionId);
                    notifications.show("Item updated.", {
                      severity: "success",
                      autoHideDuration: 3000,
                    });
                    handleClose();
                  } catch (err) {
                    fail(err);
                  }
                }}
              >
                Update Item
              </Button>
            </Stack>
          ) : (
            <Stack spacing={0.5} sx={{ py: 0.5, width: "100%" }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setOptionPicker({
                    pickerMode: "addToSchedule",
                    optionId: optionRow.optionId,
                    label: optionRow.label,
                  })
                }
              >
                Add to Schedule
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  setOptionPicker({
                    pickerMode: "addToLibrary",
                    optionId: optionRow.optionId,
                    label: optionRow.label,
                  })
                }
              >
                Add to Library
              </Button>
            </Stack>
          ),
      },
    ],
    [context, editableOptions],
  );

  if (!mode || !row) return null;
  const pickable = activeMode === "addToLibrary" || activeMode === "addToSchedule";
  const isGrid = activeMode === "versions" || activeMode === "options";

  return (
    <Dialog open onClose={handleClose} fullWidth maxWidth={isGrid ? "lg" : "sm"}>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <span>{TITLES[activeMode]}</span>
          <Chip size="small" label={optionPicker?.label ?? row.desc ?? "(unnamed spec)"} />
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        {rows === null ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">
            {activeMode === "addToLibrary"
              ? "You have no libraries yet — create one on the My Libraries page first."
              : "Nothing to show."}
          </Typography>
        ) : isGrid ? (
          <>
            {activeMode === "options" && editableOptions && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Double-click an option to edit; click elsewhere to save. Edits are
                kept as new versions.
              </Typography>
            )}
            <div style={{ width: "100%", height: "60vh", minHeight: 300 }}>
              <DataGrid
                rows={rows}
                columns={activeMode === "options" ? optionColumns : versionColumns}
                disableRowSelectionOnClick
                editMode="row"
                isCellEditable={() => activeMode === "options" && editableOptions}
                onCellKeyDown={multilineEnterGuard(["spec"])}
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={fail}
                getRowHeight={() => "auto"}
                sx={gridBorderSx}
                hideFooter={rows.length <= 25}
              />
            </div>
          </>
        ) : (
          <List dense>
            {rows.map((entry) => (
              <ListItemButton
                key={entry.id}
                onClick={async () => {
                  try {
                    await entry.onPick();
                  } catch (err) {
                    fail(err);
                  }
                }}
              >
                <ListItemText primary={entry.primary} secondary={entry.secondary} />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        {activeMode === "options" && editableOptions && (
          <Button startIcon={<AddIcon />} onClick={handleCreateOption}>
            Create New Option
          </Button>
        )}
        {optionPicker && (
          <Button onClick={() => setOptionPicker(null)}>Back to Options</Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
