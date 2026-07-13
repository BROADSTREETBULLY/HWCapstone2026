//TODO: token verification for protected routes
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  // 1. Get the Authorization header from the client
  const authHeader = req.headers["authorization"];

  // 2. Extract the token
  const token = authHeader && authHeader.split(" ")[1]; // Format: "Bearer TOKEN"

  if (!token) return res.sendStatus(401); // No token provided

  // 3. Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid or expired token

    // 4. Attach user info to the request object for use in the route
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };
