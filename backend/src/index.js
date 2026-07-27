const express = require("express");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const app = express();
app.use(express.json());
const port = 3000;

let dbConnect = require("./services/dbConnect");

const userRoutes = require("./routes/userRoutes");
const specRoutes = require("./routes/specRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const projectRoutes = require("./routes/projectRoutes");

app.use("/api/specs", specRoutes);
app.use("/api/users", userRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
