import * as React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications/useNotifications";
import {
  getSchedules,
  createSchedule,
  deleteSchedule,
} from "../data/schedules";
import PageContainer from "../components/PageContainer";


const LAST_PROJECT_KEY = "schedulr.lastProjectID";

export default function ScheduleList() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [rows, setRows] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);


  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [projectID, setProjectID] = React.useState(
    localStorage.getItem(LAST_PROJECT_KEY) ?? "",
  );
  const [scheduleType, setScheduleType] = React.useState("");
  const [scheduleTitle, setScheduleTitle] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const loadData = React.useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const schedules = await getSchedules(); 
      setRows(
        schedules.map((s) => ({
          id: s._id,
          scheduleTitle: s.scheduleTitle,
          scheduleType: s.scheduleType,
          scheduleStatus: s.scheduleStatus,
          createdAt: s.createdAt,
        })),
      );
    } catch (err) {
      setError(err);
    }
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!projectID || !scheduleType) {
      notifications.show("Project ID and schedule type are required.", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }
    setIsSaving(true);
    try {
      const created = await createSchedule({
        projectID: projectID.trim(),
        scheduleType: scheduleType.trim(),
        scheduleTitle: scheduleTitle.trim() || undefined,
      });
      localStorage.setItem(LAST_PROJECT_KEY, projectID.trim());
      setDialogOpen(false);
      setScheduleType("");
      setScheduleTitle("");
      notifications.show("Schedule created.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate(`/dashboard/schedules/${created._id}`);
    } catch (err) {
      notifications.show(`Failed to create schedule. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
    setIsSaving(false);
  };

  const handleDelete = React.useCallback(
    async (row) => {
      if (!window.confirm(`Delete "${row.scheduleTitle}"?`)) return;
      try {
        await deleteSchedule(row.id);
        notifications.show("Schedule deleted.", {
          severity: "success",
          autoHideDuration: 3000,
        });
        loadData();
      } catch (err) {
        notifications.show(`Failed to delete schedule. Reason: ${err.message}`, {
          severity: "error",
          autoHideDuration: 5000,
        });
      }
    },
    [loadData, notifications],
  );

  const columns = React.useMemo(
    () => [
      { field: "scheduleTitle", headerName: "Title", flex: 1, minWidth: 200 },
      { field: "scheduleType", headerName: "Type", width: 140 },
      { field: "scheduleStatus", headerName: "Status", width: 110 },
      {
        field: "createdAt",
        headerName: "Created",
        width: 160,
        valueGetter: (value) => (value ? new Date(value).toLocaleString() : ""),
      },
      {
        field: "actions",
        type: "actions",
        width: 90,
        getActions: ({ row }) => [
          <GridActionsCellItem
            key="open"
            icon={<OpenInNewIcon />}
            label="Open"
            onClick={() => navigate(`/dashboard/schedules/${row.id}`)}
          />,
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDelete(row)}
          />,
        ],
      },
    ],
    [navigate, handleDelete],
  );

  return (
    <PageContainer
      title="Schedules"
      breadcrumbs={[{ title: "Dashboard", path: "/dashboard" }, { title: "Schedules" }]}
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Schedule
        </Button>
      }
    >
      {error ? (
        <Alert severity="error">{error.message}</Alert>
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          onRowDoubleClick={({ row }) =>
            navigate(`/dashboard/schedules/${row.id}`)
          }
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[10, 25, 50]}
        />
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth>
        <DialogTitle>New Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Project ID"
              value={projectID}
              onChange={(e) => setProjectID(e.target.value)}
              helperText="MongoDB id of the project (from Compass) — remembered for next time"
              required
            />
            <TextField
              label="Schedule type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              helperText='e.g. "Furniture", "Finishes", "Lighting"'
              required
            />
            <TextField
              label="Title (optional)"
              value={scheduleTitle}
              onChange={(e) => setScheduleTitle(e.target.value)}
              helperText='Defaults to "<type> Schedule"'
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isSaving}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
