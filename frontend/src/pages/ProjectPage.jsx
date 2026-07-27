import * as React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useNavigate, useParams } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import ProjectFormDialog from "../components/ProjectFormDialog";
import { PROJECT_PLACEHOLDER } from "../components/ProjectCard";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { getProject, updateProject } from "../data/projects";
import { getSchedules, createSchedule, deleteSchedule } from "../data/schedules";

export default function ProjectPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [project, setProject] = React.useState(null);
  const [schedules, setSchedules] = React.useState([]);
  const [editOpen, setEditOpen] = React.useState(false);

  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [scheduleType, setScheduleType] = React.useState("");
  const [scheduleTitle, setScheduleTitle] = React.useState("");

  const loadData = React.useCallback(async () => {
    try {
      const [projectData, scheduleData] = await Promise.all([
        getProject(projectId),
        getSchedules(projectId),
      ]);
      setProject(projectData);
      setSchedules(scheduleData);
    } catch (err) {
      notifications.show(`Failed to load project. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  }, [projectId, notifications]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditSave = async (values) => {
    try {
      await updateProject(projectId, values);
      notifications.show("Project updated.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      loadData();
    } catch (err) {
      notifications.show(`Failed to update project. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
      throw err;
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleType.trim()) return;
    try {
      const created = await createSchedule({
        projectID: projectId,
        scheduleType: scheduleType.trim(),
        scheduleTitle: scheduleTitle.trim() || undefined,
      });
      setScheduleOpen(false);
      setScheduleType("");
      setScheduleTitle("");
      navigate(`/dashboard/schedules/${created._id}`);
    } catch (err) {
      notifications.show(`Failed to create schedule. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  const handleDeleteSchedule = async (schedule) => {
    if (!window.confirm(`Delete "${schedule.scheduleTitle}"?`)) return;
    try {
      await deleteSchedule(schedule._id);
      loadData();
    } catch (err) {
      notifications.show(`Failed to delete schedule. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  return (
    <PageContainer
      title={project?.projectName ?? "Project"}
      breadcrumbs={[
        { title: "Dashboard", path: "/dashboard" },
        { title: "Projects", path: "/dashboard/projects-page" },
        { title: project?.projectName ?? "..." },
      ]}
      actions={
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setScheduleOpen(true)}
          >
            New Schedule
          </Button>
          <Tooltip title="Edit project details">
            <Button variant="outlined" onClick={() => setEditOpen(true)}>
              <EditIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Stack>
      }
    >
      {project && (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Card variant="outlined" sx={{ maxWidth: 400, flexShrink: 0 }}>
            <CardMedia
              component="img"
              height="180"
              image={project.projectImage || PROJECT_PLACEHOLDER}
              alt={project.projectName}
              onError={(e) => (e.target.src = PROJECT_PLACEHOLDER)}
            />
            <CardContent>
              <Typography variant="h6">{project.projectName}</Typography>
              <Typography color="text.secondary" gutterBottom>
                {project.projectNumber}
              </Typography>
              {project.projectAddress && (
                <Typography variant="body2" gutterBottom>
                  {project.projectAddress}
                </Typography>
              )}
              {project.projectDescription && (
                <Typography variant="body2" gutterBottom>
                  {project.projectDescription}
                </Typography>
              )}
              {project.projectComments && (
                <Typography variant="body2" color="text.secondary">
                  {project.projectComments}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ flexGrow: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Schedules
              </Typography>
              {schedules.length === 0 && (
                <Typography color="text.secondary">
                  No schedules yet — create one with the New Schedule button.
                </Typography>
              )}
              <List>
                {schedules.map((schedule) => (
                  <ListItem
                    key={schedule._id}
                    disablePadding
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteSchedule(schedule)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemButton
                      onClick={() => navigate(`/dashboard/schedules/${schedule._id}`)}
                    >
                      <ListItemText
                        primary={schedule.scheduleTitle}
                        secondary={`${schedule.scheduleType} · ${schedule.scheduleStatus}`}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      )}

      <ProjectFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        initialValues={project ?? undefined}
      />

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} fullWidth>
        <DialogTitle>New Schedule</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              required
              label="Schedule type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
              helperText='e.g. "Furniture", "Finishes", "Lighting"'
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
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateSchedule}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}
