import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import SpecSearch from "../components/SpecSearch";
import ProjectCard from "../components/ProjectCard";

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  ...theme.typography.body2,
  display: "flex",
  alignItems: "center",
}));

function Dashboard() {
  return (
    <>
          <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
        <DemoPaper square={false} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-evenly", width: "100%" }}
          >
            <Button variant="contained" href="/about">
              New Project
            </Button>
            <Button variant="contained" href="/about">
              Add Existing Project
            </Button>
            <Button variant="contained" href="/about">
              Add new Spec
            </Button>
          </Stack>
        </DemoPaper>
      </Container>
          <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
        <DemoPaper square={false} sx={{ mt: 2 }}>
          <Stack
            direction="row"
            sx={{ justifyContent: "space-evenly", width: "100%" }}
          >
            <SpecSearch />
          </Stack>
        </DemoPaper>
      </Container>
         <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
        <DemoPaper square={false} sx={{ mt: 2 }}>
          <Stack direction="column">
              <h2>Recent Projects</h2>
               <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
              <ProjectCard />
            </Container>
          </Stack>
        </DemoPaper>
      </Container>
    </>
  );
}

export default Dashboard;
