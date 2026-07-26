const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");
const { validateObjectId } = require("../middleware/validateObjectId");

const {
  createLibrary,
  getLibraries,
  updateLibrary,
  deleteLibrary,
  addLibraryItem,
  getLibraryItems,
  removeLibraryItem,
} = require("../controllers/libraryController");


const statusFor = (error) => {
  if (error.status) return error.status;
  if (error.message?.startsWith("Invalid request body")) return 400;
  if (error.message?.includes("not found")) return 404;
  return 500;
};


const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);


protectedRouter.post("/", async (req, res) => {
  try {
    const library = await createLibrary(req.body, req.user.userId);
    res.status(201).send(library);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});


protectedRouter.get("/", async (req, res) => {
  try {
    const libraries = await getLibraries(req.user.userId);
    res.status(200).send(libraries);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});


protectedRouter.delete(
  "/items/:libraryItemId",
  validateObjectId("libraryItemId"),
  async (req, res) => {
    try {
      await removeLibraryItem(req.params.libraryItemId, req.user.userId);
      res.status(204).send();
    } catch (error) {
      res.status(statusFor(error)).json({ error: error.message });
    }
  },
);


protectedRouter.put("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const library = await updateLibrary(req.params.id, req.body, req.user.userId);
    res.status(200).send(library);
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});


protectedRouter.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    await deleteLibrary(req.params.id, req.user.userId);
    res.status(204).send();
  } catch (error) {
    res.status(statusFor(error)).json({ error: error.message });
  }
});


protectedRouter.get(
  "/:id/items",
  validateObjectId("id"),
  async (req, res) => {
    try {
      const items = await getLibraryItems(req.params.id, req.user.userId);
      res.status(200).send(items);
    } catch (error) {
      res.status(statusFor(error)).json({ error: error.message });
    }
  },
);


protectedRouter.post(
  "/:id/items",
  validateObjectId("id"),
  async (req, res) => {
    try {
      const item = await addLibraryItem(req.params.id, req.body, req.user.userId);
      res.status(201).send(item);
    } catch (error) {
      res.status(statusFor(error)).json({ error: error.message });
    }
  },
);

router.use("/", protectedRouter);

module.exports = router;
