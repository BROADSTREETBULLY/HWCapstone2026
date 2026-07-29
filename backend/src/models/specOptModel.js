// An option = one variant of a spec (e.g. the same chair in a different
// colour). currentVersionID is the pointer that says which version is live.
// The two "breadcrumb" fields are what make push-to-library work:
//   derivedFromVersionID = the org version this copy came FROM
//   pushedAsOptionID     = the org option this copy was pushed TO

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