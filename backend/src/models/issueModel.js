// An issue = a schedule formally sent out (issued) at a point in time.
// The rows are COPIED into the issue as plain text so an old issue always
// shows exactly what was sent, even if the specs change afterwards.
// Modelled for the next stage of the project - no routes use it yet.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IssueItemSchema = new Schema(
  {
    code: { type: String, trim: true },
    description: { type: String, trim: true },
    specificationText: { type: String, trim: true }, // rendered/frozen text at time of issue
    supplierText: { type: String, trim: true },       // rendered/frozen text at time of issue
    imageKey: { type: String, trim: true },
    notes: { type: String, trim: true },
    rowRevLabel: { type: String, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: true } // keep _id so each row still has a unique identifier within the array
);

const IssueSchema = new Schema(
  {
    scheduleID: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "issued", "withdrawn"],
      default: "draft",
    },
    revLabel: { type: String, trim: true },
    description: { type: String, trim: true },
    revisionDate: { type: Date },
    issuedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amendedFromIssueID: {
      type: Schema.Types.ObjectId,
      ref: "Issue", // self reference for times when issues are amended after being "issued"
    },
    amendmentReason: { type: String, trim: true },
    amendedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", IssueSchema);
