// All /api/schedules routes - schedules and their items.

const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validateObjectId");

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
  addItemFromLibrary,
} = require("../controllers/scheduleController");


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
    const schedule = await createSchedule(req.body, req.user.userId);
    res.status(201).send(schedule);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/", async (req, res) => {
  try {
    const schedules = await getSchedules(req.query.projectID);
    res.status(200).send(schedules);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/items/:itemId", validateObjectId("itemId"), async (req, res) => {
  try {
    const item = await getItem(req.params.itemId);
    res.status(200).send(item);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.put("/items/:itemId", validateObjectId("itemId"), async (req, res) => {
  try {
    const item = await updateItem(req.params.itemId, req.body, req.user.userId);
    res.status(200).send(item);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.delete("/items/:itemId", validateObjectId("itemId"), async (req, res) => {
  try {
    await deleteItem(req.params.itemId);
    res.status(204).send();
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const schedule = await getSchedule(req.params.id);
    res.status(200).send(schedule);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.put("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const schedule = await updateSchedule(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.status(200).send(schedule);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    await deleteSchedule(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.get("/:id/items", validateObjectId("id"), async (req, res) => {
  try {
    const items = await getItemsForSchedule(req.params.id);
    res.status(200).send(items);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

protectedRouter.post("/:id/items", validateObjectId("id"), async (req, res) => {
  try {
    const result = await createItemWithSpec(
      req.params.id,
      req.body,
      req.user.userId,
    );
    res.status(201).send(result);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});

//add a library option to this schedule (clones it into a schedule-local family)
protectedRouter.post(
  "/:id/items/from-library",
  validateObjectId("id"),
  async (req, res) => {
    try {
      const result = await addItemFromLibrary(
        req.params.id,
        req.body,
        req.user.userId,
      );
      res.status(201).send(result);
    } catch (error) {
      res.status(statusFor(error)).json({ error: error.message });
    }
  },
);

router.use("/", protectedRouter);

module.exports = router;