import * as React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useParams } from "react-router-dom";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { getUser } from "../data/api";
import {
  getSchedule,
  updateSchedule,
  getItems,
  createItem,
  addFromLibrary,
  updateItem,
  deleteItem,
} from "../data/schedules";
import {
  createVersion,
  pushToLibrary,
  updateSpecFields,
  supplierFromVersion,
  upsertSupplierLine,
} from "../data/specs";
import { getProject } from "../data/projects";
import SpecSearch from "../components/SpecSearch";
import ImageEditCell from "../components/ImageEditCell";
import MultilineEditCell from "../components/MultilineEditCell";
import PageContainer from "../components/PageContainer";
import PushToOrgDialog from "../components/PushToOrgDialog";
import { gridBorderSx, multilineEnterGuard } from "../data/taxonomy";


function toRow(item) {
  const option = item.optionID && typeof item.optionID === "object" ? item.optionID : null;
  const version =
    option?.currentVersionID && typeof option.currentVersionID === "object"
      ? option.currentVersionID
      : null;
  const spec = option?.specID && typeof option.specID === "object" ? option.specID : null;
  return {
    id: item._id,
    sortOrder: item.sortOrder ?? 0,
    itemCode: item.itemCode ?? "",
    desc: version?.productName ?? "",
    spec: version?.rawText ?? "",
    supplier: supplierFromVersion(version),
    category: spec?.category ?? "",
    subCategory: spec?.subCategory ?? "",
    image: version?.imageKey ?? "",
    revisedOn: version?.createdAt ?? null,
    specId: spec?._id ?? null,
    optionId: option?._id ?? null,
    derived: Boolean(option?.derivedFromVersionID),
    pushed: Boolean(option?.pushedAsOptionID),
  };
}

const STATUS_OPTIONS = ["draft", "issued", "superseded", "archived"];

export default function ScheduleShow() {
  const { scheduleId } = useParams();
  const notifications = useNotifications();

  const [schedule, setSchedule] = React.useState(null);
  const [project, setProject] = React.useState(null);
  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [scheduleData, items] = await Promise.all([
        getSchedule(scheduleId),
        getItems(scheduleId),
      ]);
      setSchedule(scheduleData);
      setRows(items.map(toRow).sort((a, b) => a.sortOrder - b.sortOrder));
      if (scheduleData?.projectID) {
        getProject(scheduleData.projectID)
          .then(setProject)
          .catch(() => setProject(null));
      }
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
  }, [scheduleId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (event) => {
    const scheduleStatus = event.target.value;
    setSchedule((s) => ({ ...s, scheduleStatus }));
    try {
      await updateSchedule(scheduleId, { scheduleStatus });
    } catch (err) {
      notifications.show(`Failed to update status. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleAddFromLibrary = async (spec) => {
    if (!spec.optionId) {
      notifications.show("That spec has no option to add yet.", {
        severity: "error",
        autoHideDuration: 4000,
      });
      return;
    }
    try {
      await addFromLibrary(scheduleId, {
        optionID: spec.optionId,
        sortOrder: rows.length,
      });
      notifications.show(`"${spec.desc}" added to schedule.`, {
        severity: "success",
        autoHideDuration: 3000,
      });
      loadData();
    } catch (err) {
      notifications.show(`Failed to add spec. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleNewSpec = async () => {
    try {
      const minSort = rows.length ? Math.min(...rows.map((r) => r.sortOrder)) : 1;
      await createItem(scheduleId, {
        orgId: getUser()?.orgId,
        productName: "",
        rawText: " ",
        sortOrder: minSort - 1,
      });
      loadData();
    } catch (err) {
      notifications.show(`Failed to create spec. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const processRowUpdate = React.useCallback(async (newRow, oldRow) => {
    if (newRow.itemCode !== oldRow.itemCode) {
      await updateItem(newRow.id, { itemCode: newRow.itemCode });
    }
    if (
      newRow.desc !== oldRow.desc ||
      newRow.spec !== oldRow.spec ||
      newRow.image !== oldRow.image ||
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
      });
      return {
        ...newRow,
        spec: version.rawText,
        revisedOn: version.createdAt,
      };
    }
    return newRow;
  }, []);

  const handleProcessRowUpdateError = React.useCallback(
    (err) => {
      notifications.show(`Failed to save changes. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    },
    [notifications],
  );

  const [pushRow, setPushRow] = React.useState(null);
  const handlePushConfirm = React.useCallback(
    async ({ cleanedText, category, subCategory }) => {
      const row = pushRow;
      try {
        const textChanged = cleanedText !== row.spec;
        if (category && row.specId) {
          await updateSpecFields(row.specId, { category, subCategory });
        }
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
        notifications.show(
          row.derived
            ? "Pushed back to the org library as a new version."
            : "Added to the org library.",
          { severity: "success", autoHideDuration: 4000 },
        );
        loadData();
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
    [pushRow, loadData, notifications],
  );

  const columns = React.useMemo(
    () => [
      { field: "itemCode", headerName: "Item Code", width: 100, editable: true },
      { field: "desc", headerName: "Description", flex: 1, minWidth: 150, editable: true },
      {
        field: "spec",
        headerName: "Specification",
        flex: 2,
        minWidth: 220,
        editable: true,
        renderEditCell: (params) => <MultilineEditCell {...params} />,
        renderCell: ({ value }) => (
          <div style={{ whiteSpace: "pre-line", padding: "8px 0" }}>{value}</div>
        ),
      },
      { field: "supplier", headerName: "Supplier", width: 130, editable: true },
      { field: "subCategory", headerName: "Sub Category", width: 130 },
      {
        field: "image",
        headerName: "Image",
        width: 130,
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
      {
        field: "revisedOn",
        headerName: "Revised On",
        width: 110,
        type: "date",
        valueGetter: (value) => (value ? new Date(value) : null),
      },
      {
        field: "push",
        headerName: "",
        width: 140,
        sortable: false,
        filterable: false,
        renderCell: ({ row }) =>
          row.derived || !row.pushed ? (
            <Tooltip
              title={
                row.derived
                  ? "Send your edits back to the org library as a new version"
                  : "Add this new spec to the org library"
              }
            >
              <Button size="small" variant="outlined" onClick={() => setPushRow(row)}>
                PUSH TO ORG
              </Button>
            </Tooltip>
          ) : null,
      },
      {
        field: "actions",
        type: "actions",
        width: 60,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={async () => {
              if (!window.confirm("Remove this item from the schedule?")) return;
              try {
                await deleteItem(row.id);
                loadData();
              } catch (err) {
                notifications.show(
                  `Failed to delete item. Reason: ${err.message}`,
                  { severity: "error", autoHideDuration: 5000 },
                );
              }
            }}
          />,
        ],
      },
    ],
    [loadData, notifications],
  );

  return (
    <PageContainer
      title={schedule?.scheduleTitle ?? "Schedule"}
      breadcrumbs={[
        { title: "Dashboard", path: "/dashboard" },
        {
          title: project?.projectName ?? "Project",
          path: project ? `/dashboard/projects/${project._id}` : undefined,
        },
        { title: schedule?.scheduleTitle ?? "..." },
      ]}
      actions={
        <Stack direction="row" spacing={1} alignItems="center">
          <SpecSearch onAdd={handleAddFromLibrary} />
          <Tooltip title="Create a new spec in this schedule">
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewSpec}>
              New Spec
            </Button>
          </Tooltip>
          <Tooltip title="Reload">
            <Button variant="outlined" onClick={loadData}>
              <RefreshIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      {schedule && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Chip size="small" label={schedule.scheduleType} />
            <Select
              size="small"
              value={schedule.scheduleStatus ?? "draft"}
              onChange={handleStatusChange}
              sx={{ minWidth: 130 }}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Stack>
          {project && (
            <Typography variant="body2" color="text.secondary">
              {project.projectName} · {project.projectNumber}
              {project.projectAddress ? ` · ${project.projectAddress}` : ""}
            </Typography>
          )}
          {schedule.scheduleDescription && (
            <Typography variant="body2">{schedule.scheduleDescription}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            Double-click a row to edit; click elsewhere to save. Content edits are
            kept as new versions — history is never overwritten.
          </Typography>
        </Box>
      )}
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <Box sx={{ width: "100%", height: "calc(100vh - 360px)", minHeight: 360 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={isLoading}
            disableRowSelectionOnClick
            editMode="row"
            onCellKeyDown={multilineEnterGuard(["spec"])}
            processRowUpdate={processRowUpdate}
            onProcessRowUpdateError={handleProcessRowUpdateError}
            getRowHeight={() => "auto"}
            sx={gridBorderSx}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            pageSizeOptions={[25, 50, 100]}
          />
        </Box>
      )}
      <PushToOrgDialog
        open={Boolean(pushRow)}
        row={pushRow}
        askCategory={!pushRow?.derived}
        onClose={() => setPushRow(null)}
        onConfirm={handlePushConfirm}
      />
    </PageContainer>
  );
}
