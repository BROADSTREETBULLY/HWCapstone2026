const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SpecOptionSchema = new Schema(
  {
    specID: { type: Schema.Types.ObjectId, ref: "Spec", required: true },
    currentVersionID: { type: Schema.Types.ObjectId, ref: "SpecVersion" }, // null at creation
    derivedFromVersionID: { type: Schema.Types.ObjectId, ref: "SpecVersion" }, // breadcrumb in
    pushedAsOptionID: { type: Schema.Types.ObjectId, ref: "SpecOption" }, // breadcrumb out
    isRedundant: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SpecOption", SpecOptionSchema);