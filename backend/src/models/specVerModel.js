const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpecVersionAttributeSchema = new Schema(
  {
    key: { type: String, trim: true },
    value: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true },
);

const SpecVersionSchema = new Schema({
  optionID: { type: Schema.Types.ObjectId, ref: "SpecOption", required: true },
  supplierID: { type: Schema.Types.ObjectId, ref: "Supplier" },
  versionNumber: { type: Number, required: true },
  productName: { type: String, trim: true },
  rawText: { type: String, trim: true },
  imageKey: { type: String, trim: true },
  internalComments: { type: String, trim: true },
  attributes: [SpecVersionAttributeSchema],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now }, 
});

module.exports = mongoose.model("SpecVersion", SpecVersionSchema);