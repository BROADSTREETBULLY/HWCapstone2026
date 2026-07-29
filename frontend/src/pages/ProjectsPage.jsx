import * as React from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ProjectCard from "../components/ProjectCard";
import ProjectFormDialog from "../components/ProjectFormDialog";
import PageContainer from "../components/PageContainer";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { getProjects, createProject, deleteProject } from "../data/projects";
import { getSchedules } from "../data/schedules";

export default function ProjectsPage() {
  const notifications = useNotifications();

  const [projects, setProjects] = React.useState([]);
  const [schedulesByProject, setSchedulesByProject] = React.useState({});
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // every project in the org, plus each one's schedules for the card buttons
  const loadData = React.useCallback(async () => {
    try {
      const data = await getProjects();
      setProjects(data);
      const entries = await Promise.all(
        data.map(async (p) => [p._id, await getSchedules(p._id).catch(() => [])]),
      );
      setSchedulesByProject(Object.fromEntries(entries));
    } catch (err) {
      notifications.show(`Failed to load projects. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  }, [notifications]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (values) => {
    try {
      await createProject(values);
      notifications.show("Project created.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      loadData();
    } catch (err) {
      notifications.show(`Failed to create project. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
      throw err;
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`Delete project "${project.projectName}"?`)) return;
    try {
      await deleteProject(project._id);
      loadData();
    } catch (err) {
      notifications.show(`Failed to delete project. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
    }
  };

  return (
    <PageContainer
      title="Projects"
      breadcrumbs={[{ title: "Dashboard", path: "/dashboard" }, { title: "Projects" }]}
      actions={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          New Project
        </Button>
      }
    >
      {projects.length === 0 && (
        <Typography color="text.secondary">No projects yet.</Typography>
      )}
      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 2 }}>
        {projects.map((project) => (
          <Box key={project._id} sx={{ position: "relative" }}>
            <ProjectCard
              project={project}
              schedules={schedulesByProject[project._id] ?? []}
            />
            <Tooltip title="Delete project">
              <IconButton
                size="small"
                onClick={() => handleDelete(project)}
                sx={{ position: "absolute", top: 4, right: 4, bgcolor: "background.paper" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ))}
      </Stack>

      <ProjectFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreate}
      />
    </PageContainer>
  );
}
