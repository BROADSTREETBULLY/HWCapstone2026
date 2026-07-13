import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import LoginForm from "../components/LoginForm";

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: "center",
}));

function HomePage() {
  return (
    <>
    <Container maxWidth={false} sx={{ flex: 1, display: 'flex', flexDirection: 'column', mt: 2 }}>
        <Stack direction="row" spacing={2} margin={2}>
          <DemoPaper square={false}>
            <h3>
              <b>
                A truly collaborative scheduling platform for architects and
                designers.
              </b>
              <br />
              Where knowledge can be shared amongst the team.
              <br /> Designed by industry professionals for industry
              professionals.
              <br />
              <br />{" "}
              <Button variant="contained" href="/about">
                Learn More Here
              </Button>{" "}
            </h3>
          </DemoPaper>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          {" "}
          <DemoPaper square={false}><LoginForm /></DemoPaper>
        </Stack>
      </Container>
    </>
  );
}

export default HomePage;
