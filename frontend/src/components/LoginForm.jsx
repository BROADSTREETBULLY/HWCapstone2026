import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from '@mui/material/Card';

function LoginForm() {
  return (
    <>
      <Card variant="outlined">
        <h1>Login</h1>
        <p>Email:</p>
        <TextField
          required
          id="outlined-required"
          label="Required"
          defaultValue=""
        />
        <p>Password:</p>
        <TextField
          required
          id="outlined-required"
          label="Required"
          defaultValue=""
        /> <br /><br />
        <Button variant="contained" href="/dashboard">
          Login
        </Button> <br /><br />
     </Card>
    </>
  );
}

export default LoginForm;
