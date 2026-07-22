const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SupplierSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    supplierName: { type: String, trim: true, required: true },
    website: { type: String, trim: true },
    category: { type: String, trim: true },
    isRedundant: { type: Boolean, default: false },
    redundantBy: { type: Schema.Types.ObjectId, ref: "User" },
    redundantReason: { type: String, trim: true },
    redundantAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Supplier", SupplierSchema);