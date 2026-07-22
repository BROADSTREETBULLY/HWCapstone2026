const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpecSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    ownerType: {
      type: String,
      enum: ["library", "schedule"],
      required: true,
      immutable: true, // set at birth, never changes
    },
    scheduleID: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: function () { return this.ownerType === "schedule"; }, // null if library
    },
    category: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);


module.exports = mongoose.model("Spec", SpecSchema);
