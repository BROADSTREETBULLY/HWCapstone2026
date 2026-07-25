const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

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
} = require("../controllers/specController");

const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

protectedRouter.post("/query", async (req, res) => {
  try {
    const result = await querySpecLibrary(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

protectedRouter.post("/", async (req, res) => {
  try {
    const spec = await createSpec(req.body, req.user.userId);
    res.status(201).send(spec);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});

protectedRouter.get("/options/:optionId", async (req, res) => {
  try {
    const option = await getOption(req.params.optionId);
    res.status(200).send(option);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.put("/options/:optionId", async (req, res) => {
  try {
    const option = await updateOption(req.params.optionId, req.body);
    res.status(200).send(option);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.post("/options/:optionId/versions", async (req, res) => {
  try {
    const version = await createVersion(
      req.params.optionId,
      req.body,
      req.user.userId,
    );
    res.status(201).send(version);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});

protectedRouter.get("/options/:optionId/versions", async (req, res) => {
  try {
    const versions = await getVersionsForOption(req.params.optionId);
    res.status(200).send(versions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

protectedRouter.get("/versions/:versionId", async (req, res) => {
  try {
    const version = await getVersion(req.params.versionId);
    res.status(200).send(version);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.get("/:id", async (req, res) => {
  try {
    const spec = await getSpec(req.params.id);
    res.status(200).send(spec);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.put("/:id", async (req, res) => {
  try {
    const spec = await updateSpec(req.params.id, req.body, req.user.userId);
    res.status(200).send(spec);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.delete("/:id", async (req, res) => {
  try {
    await deleteSpec(req.params.id);
    res.status(204).send();
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.post("/:id/options", async (req, res) => {
  try {
    const option = await createOption(req.params.id, req.body, req.user.userId);
    res.status(201).send(option);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.get("/:id/options", async (req, res) => {
  try {
    const options = await getOptionsForSpec(req.params.id);
    res.status(200).send(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use("/", protectedRouter);

module.exports = router;
