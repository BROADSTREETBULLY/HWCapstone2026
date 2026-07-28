// Builds the Express app but does NOT start it listening.
// Kept separate from index.js so the tests can import the app and run it
// against an in-memory database without starting a real server.


const express = require("express");
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const app = express();
// express.json() lets us read JSON request bodies
app.use(express.json());

let dbConnect = require("./services/dbConnect");

const userRoutes = require("./routes/userRoutes");
const specRoutes = require("./routes/specRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const libraryRoutes = require("./routes/libraryRoutes");
const projectRoutes = require("./routes/projectRoutes");

// every route file gets mounted under its own /api path
app.use("/api/users", userRoutes);
app.use("/api/specs", specRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/libraries", libraryRoutes);
app.use("/api/projects", projectRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = app;
