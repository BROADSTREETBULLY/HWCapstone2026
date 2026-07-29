// All /api/projects routes.

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validateObjectId");

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// turns an error into the right HTTP status code, so the routes below can
// all handle errors the same simple way
const statusFor = (error) => {
  if (error.status) return error.status;
  if (error.message?.startsWith("Invalid request body")) return 400;
  if (error.message?.includes("not found")) return 404;
  return 500;
};

// everything on this router needs a valid login token - applying it once
// here is safer than remembering it on every single route
const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

protectedRouter.post("/", async (req, res) => {
  try {
    const project = await createProject(req.body, req.user.userId);
    res.status(201).send(project);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/", async (req, res) => {
  try {
    const projects = await getProjects(req.user.userId);
    res.status(200).send(projects);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const project = await getProject(req.params.id);
    res.status(200).send(project);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.put("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const project = await updateProject(req.params.id, req.body, req.user.userId);
    res.status(200).send(project);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    await deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

router.use("/", protectedRouter);

module.exports = router;
