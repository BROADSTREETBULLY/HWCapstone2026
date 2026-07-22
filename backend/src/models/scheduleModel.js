const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema(
  {
    projectID: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    scheduleType: { type: String, trim: true, required: true },
    scheduleTitle: { type: String, trim: true },
    scheduleStatus: { type: String, trim: true, default: "draft" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    scheduleDescription: { type: String, trim: true },
    scheduleComments: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Schedule", ScheduleSchema);
