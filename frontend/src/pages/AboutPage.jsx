import { useState, useEffect } from "react";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";

const DemoPaper = styled(Paper)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(2),
  ...theme.typography.body2,
  textAlign: "center",
}));

function AboutPage() {
  return (
    <Container sx={{ mt: 2 }}>
      <Stack direction="row" spacing={2} margin={2}>
        <DemoPaper square={false}>
          <h1>
            About Page <br />
          </h1>
          <h2>Coming Soon<br /></h2>
          <Button variant="contained" href="/">
            Return Home
          </Button>
          <br />
          <br />
        </DemoPaper>
      </Stack>
    </Container>
  );
}

export default AboutPage;
