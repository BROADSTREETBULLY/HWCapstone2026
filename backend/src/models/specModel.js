const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const specSchema = new Schema({
  specification: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  supplier: { type: String, trim: true },
  category: { type: String, trim: true },
  specImage: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("spec", specSchema);