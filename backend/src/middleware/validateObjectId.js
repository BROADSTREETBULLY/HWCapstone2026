//validates that any :id style params are real Mongo ObjectIds before hitting controllers
const mongoose = require("mongoose");

// pass in the param names to check, e.g. validateObjectId("id")
// a bad id gets a clear 400 here instead of a confusing 500 from Mongoose
const validateObjectId = (...paramNames) => {
  return (req, res, next) => {
    for (const name of paramNames) {
      const value = req.params[name];
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        return res.status(400).json({ error: `Invalid ${name}: ${value}` });
      }
    }
    next();
  };
};

module.exports = { validateObjectId };
