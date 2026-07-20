const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const itemSchema = new Schema({
  category: { type: String, trim: true, required: true },
  createdAt: { type: Date, default: Date.now },
});


const optionSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
  colour: { type: String, trim: true, required: true },
  specification: { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  supplier: { type: String, trim: true },
  specImage: { type: String, trim: true },
  isRedundant: { type: Boolean, default: false },
  redundantReason: { type: String, trim: true },
  redundantAt: { type: Date },
  updatedAt: { type: Date, default: Date.now },
});


const versionSchema = new Schema({
  optionId: { type: Schema.Types.ObjectId, ref: "Option", required: true },
  versionNumber: { type: Number, required: true },
  isCurrent: { type: Boolean, default: true },
  colour: { type: String, trim: true },
  specification: { type: String, trim: true },
  description: { type: String, trim: true },
  supplier: { type: String, trim: true },
  specImage: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  Item: mongoose.model("Item", itemSchema),
  Option: mongoose.model("Option", optionSchema),
  Version: mongoose.model("Version", versionSchema),
};