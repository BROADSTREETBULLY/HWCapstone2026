// const express = require("express");
// const router = express.Router();

// const { authenticateToken } = require("../middleware/authMiddleware");

// // import your controllers here as you build them
// // const { someController } = require("../controllers/someController");

// // =========================================
// // PUBLIC ROUTES (no login required)
// // =========================================
// // router.post("/example-public-route", async (req, res) => {
// //   try {
// //     // your logic here
// //     res.status(200).send(result);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // =========================================
// // PARENT AUTHENTICATED ROUTE
// // Middleware applied ONCE — everything below is protected
// // =========================================
// const protectedRouter = express.Router();
// protectedRouter.use(authenticateToken);

// // Add your protected routes below this line.
// // No need to add authenticateToken to each one individually.

// // protectedRouter.get("/example-protected-route", async (req, res) => {
// //   try {
// //     // your logic here
// //     res.status(200).send(result);
// //   } catch (error) {
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // mount the protected group back onto the main router
// router.use("/", protectedRouter);

// module.exports = router;
