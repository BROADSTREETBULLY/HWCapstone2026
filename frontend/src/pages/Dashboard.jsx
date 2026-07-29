import { useState, useEffect, useCallback } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import ProjectFormDialog from "../components/ProjectFormDialog";
import useNotifications from "../hooks/useNotifications/useNotifications";
import { getProjects, createProject } from "../data/projects";
import { getSchedules } from "../data/schedules";

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  ...theme.typography.body2,
  display: "flex",
  alignItems: "center",
}));

function Dashboard() {
  const navigate = useNavigate();
  const notifications = useNotifications();

  const [recent, setRecent] = useState([]);
  const [schedulesByProject, setSchedulesByProject] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);

  // projects come back newest-updated first, so the first four are the recent
  // ones. Then fetch each one's schedules for the buttons on the cards.
  const loadData = useCallback(async () => {
    try {
      const projects = await getProjects();
      const top = projects.slice(0, 4);
      setRecent(top);
      const entries = await Promise.all(
        top.map(async (p) => [
          p._id,
          await getSchedules(p._id).catch(() => []),
        ]),
      );
      setSchedulesByProject(Object.fromEntries(entries));
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateProject = async (values) => {
    try {
      const created = await createProject(values);
      notifications.show("Project created.", {
        severity: "success",
        autoHideDuration: 3000,
      });
      navigate(`/dashboard/projects/${created._id}`);
    } catch (err) {
      notifications.show(`Failed to create project. Reason: ${err.message}`, {
        severity: "error",
        autoHideDuration: 5000,
      });
      throw err;
    }
  };

  return (
    <>
      <Container
        maxWidth={false}
        sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 2 }}
      >
        <DemoPaper square={false} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-evenly", width: "100%" }}
          >
            <Button variant="contained" onClick={() => setDialogOpen(true)}>
              New Project
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate("/dashboard/projects-page")}
            >
              Projects Page
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/library/furniture")}
            >
              Furniture Library
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/library/ffe")}
            >
              FF&E Library
            </Button>
            <Button
             variant="outlined"
              onClick={() => navigate("/dashboard/library/finishes")}
            >
              Finishes Library
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard/libraries")}
            >
              My Libraries
            </Button>
          </Stack>
        </DemoPaper>
      </Container>
      <Container
        maxWidth={false}
        sx={{ flex: 1, display: "flex", flexDirection: "column", mt: 2 }}
      >
        <DemoPaper square={false} sx={{ mt: 2 }}>
          <Stack direction="column" sx={{ width: "100%" }}>
            <h2>Recent Projects</h2>
            <Container
              maxWidth={false}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 2,
                mt: 2,
              }}
            >
              {recent.length === 0 && (
                <Typography color="text.secondary">
                  No projects yet — create your first one with the New Project
                  button.
                </Typography>
              )}
              {recent.map((project) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  schedules={schedulesByProject[project._id] ?? []}
                />
              ))}
            </Container>
            <Box
              sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}
            ></Box>
          </Stack>
        </DemoPaper>
      </Container>

      <ProjectFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleCreateProject}
      />
    </>
  );
}

export default Dashboard;
