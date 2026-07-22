const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    officeId: {
      type: Schema.Types.ObjectId,
      ref: "Office",
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    projectName: { type: String, trim: true, required: true },
    projectNumber: { type: String, trim: true, required: true },
    projectAddress: { type: String, trim: true },
    projectDescription: { type: String, trim: true },
    projectComments: { type: String, trim: true },
    projectLead: { type: Schema.Types.ObjectId, ref: "User" },
  },
{ timestamps: true },
);

module.exports = mongoose.model("Project", ProjectSchema);
