const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");


const {
  createLibrary,
  getLibraries,
  updateLibrary,
  deleteLibrary,
  addLibraryItem,
  getLibraryItems,
  removeLibraryItem,
} = require("../controllers/libraryController");


const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);


protectedRouter.post("/", async (req, res) => {
  try {
    const library = await createLibrary(req.body, req.user.userId);
    res.status(201).send(library);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});


protectedRouter.get("/", async (req, res) => {
  try {
    const libraries = await getLibraries(req.user.userId);
    res.status(200).send(libraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


protectedRouter.delete(
  "/items/:libraryItemId",
  async (req, res) => {
    try {
      await removeLibraryItem(req.params.libraryItemId);
      res.status(204).send();
    } catch (error) {
      res.status(error.message.includes("not found") ? 404 : 500).json({ error: error.message });
    }
  },
);


protectedRouter.put("/:id", validateObjectId("id"), async (req, res) => {
  try {
    const library = await updateLibrary(req.params.id, req.body);
    res.status(200).send(library);
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 500).json({ error: error.message });
  }
});


protectedRouter.delete("/:id", validateObjectId("id"), async (req, res) => {
  try {
    await deleteLibrary(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(error.message.includes("not found") ? 404 : 500).json({ error: error.message });
  }
});


protectedRouter.get(
  "/:id/items",
  async (req, res) => {
    try {
      const items = await getLibraryItems(req.params.id);
      res.status(200).send(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);


protectedRouter.post(
  "/:id/items",
  async (req, res) => {
    try {
      const item = await addLibraryItem(req.params.id, req.body);
      res.status(201).send(item);
    } catch (error) {
      const isBadRequest =
        error.message && error.message.startsWith("Invalid request body");
      res.status(isBadRequest ? 400 : 500).json({ error: error.message });
    }
  },
);

router.use("/", protectedRouter);

module.exports = router;
