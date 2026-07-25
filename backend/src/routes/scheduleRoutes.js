const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

const {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  createItemWithSpec,
  getItemsForSchedule,
  getItem,
  updateItem,
  deleteItem,
} = require("../controllers/scheduleController");

const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

protectedRouter.post("/", async (req, res) => {
  try {
    const schedule = await createSchedule(req.body, req.user.userId);
    res.status(201).send(schedule);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});

protectedRouter.get("/", async (req, res) => {
  try {
    const schedules = await getSchedules(req.query.projectID);
    res.status(200).send(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

protectedRouter.get("/items/:itemId", async (req, res) => {
  try {
    const item = await getItem(req.params.itemId);
    res.status(200).send(item);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.put("/items/:itemId", async (req, res) => {
  try {
    const item = await updateItem(req.params.itemId, req.body, req.user.userId);
    res.status(200).send(item);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.delete("/items/:itemId", async (req, res) => {
  try {
    await deleteItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.get("/:id", async (req, res) => {
  try {
    const schedule = await getSchedule(req.params.id);
    res.status(200).send(schedule);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.put("/:id", async (req, res) => {
  try {
    const schedule = await updateSchedule(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.status(200).send(schedule);
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.delete("/:id", async (req, res) => {
  try {
    await deleteSchedule(req.params.id);
    res.status(204).send();
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 500)
      .json({ error: error.message });
  }
});

protectedRouter.get("/:id/items", async (req, res) => {
  try {
    const items = await getItemsForSchedule(req.params.id);
    res.status(200).send(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

protectedRouter.post("/:id/items", async (req, res) => {
  try {
    const result = await createItemWithSpec(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.status(201).send(result);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});

router.use("/", protectedRouter);

module.exports = router;
