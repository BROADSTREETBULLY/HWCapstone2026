const express = require("express");
const router = express.Router();

const { authenticateToken } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  displayUsers,
} = require("../controllers/userAuthController");

router.post("/register", async (req, res) => {
  try {
    console.log("Received registration request with body:", req.body);
    const user = await registerUser(req.body);
    if (!user) {
      return res.status(404).send("User existed");
    }
    res.status(200).send(user);
  } catch (error) {
    const isBadRequest =
      error.message && error.message.startsWith("Invalid request body");
    res.status(isBadRequest ? 400 : 500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    const user = await loginUser({ username, password });
    res.status(200).json(user);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

//HERE FOR TESTNG PURPOSES ONLY, SHOULD BE PROTECTED IN PRODUCTION
const protectedRouter = express.Router();
protectedRouter.use(authenticateToken);

protectedRouter.get("/displayUsers", async (req, res) => {
  try {
    const users = await displayUsers();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.use("/", protectedRouter);

module.exports = router;
