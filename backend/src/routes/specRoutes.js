// All /api/specs routes - specs, their options, and their versions.

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validateObjectId");

const {
  createSpec,
  querySpecLibrary,
  getSpec,
  updateSpec,
  deleteSpec,
  createOption,
  getOptionsForSpec,
  getOption,
  updateOption,
  createVersion,
  getVersionsForOption,
  getVersion,
  pushToLibrary,
} = require("../controllers/specController");


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

protectedRouter.post("/query", async (req, res) => {
  try {
    const result = await querySpecLibrary(req.body, req.user.userId);
    res.status(200).send(result);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.post("/", async (req, res) => {
  try {
    const spec = await createSpec(req.body, req.user.userId);
    res.status(201).send(spec);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/options/:optionId",  validateObjectId("optionId"), async (req, res) => {
  try {
    const option = await getOption(req.params.optionId);
    res.status(200).send(option);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.put("/options/:optionId", validateObjectId("optionId"), async (req, res) => {
  try {
    const option = await updateOption(req.params.optionId, req.body);
    res.status(200).send(option);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.post("/options/:optionId/versions", validateObjectId("optionId"), async (req, res) => {
  try {
    const version = await createVersion(
      req.params.optionId,
      req.body,
      req.user.userId,
    );
    res.status(201).send(version);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/options/:optionId/versions", validateObjectId("optionId"), async (req, res) => {
  try {
    const versions = await getVersionsForOption(req.params.optionId);
    res.status(200).send(versions);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/versions/:versionId", validateObjectId("versionId"), async (req, res) => {
  try {
    const version = await getVersion(req.params.versionId);
    res.status(200).send(version);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const spec = await getSpec(req.params.id);
    res.status(200).send(spec);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.put("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const spec = await updateSpec(req.params.id, req.body, req.user.userId);
    res.status(200).send(spec);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    await deleteSpec(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.post("/:id/options", validateObjectId("id"), async (req, res) => {
  try {
    const option = await createOption(req.params.id, req.body, req.user.userId);
    res.status(201).send(option);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/:id/options", validateObjectId("id"), async (req, res) => {
  try {
    const options = await getOptionsForSpec(req.params.id);
    res.status(200).send(options);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.post(
  "/options/:optionId/push-to-library",
  validateObjectId("optionId"),
  async (req, res) => {
    try {
      const result = await pushToLibrary(req.params.optionId, req.user.userId);
      res.status(201).send(result);
    } catch (error) {
      res.status(statusFor(error)).json({ error: error.message });
    }
  },
);

router.use("/", protectedRouter);

module.exports = router;