const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
      ref: "Issue",
    },
    amendmentReason: { type: String, trim: true },
    amendedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Issue", IssueSchema);
