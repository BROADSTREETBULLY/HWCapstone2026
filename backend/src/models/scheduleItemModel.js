const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScheduleItemSchema = new Schema(
  {
    scheduleID: {
      type: Schema.Types.ObjectId,
      ref: "Schedule",
      required: true,
    },
    optionID: {
      type: Schema.Types.ObjectId,
      ref: "SpecOption",
      required: true,
    },
    itemCode: { type: String, trim: true },
    itemComments: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    lastChangeInIssueID: { type: Schema.Types.ObjectId, ref: "Issue" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ScheduleItem", ScheduleItemSchema);
