import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Alert from "@mui/material/Alert";
import { login } from "../data/auth";

function LoginForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // login() saves the token; if it throws, show the message instead of crashing
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    }
    setIsSubmitting(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <Card variant="outlined">
      <h1>Login</h1>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", pb: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          required
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <TextField
          required
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </Box>
    </Card>
  );
}

export default LoginForm;
