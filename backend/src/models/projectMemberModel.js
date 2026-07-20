const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectMemberSchema = new Schema(
  {
    member: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectID: { type: Schema.Types.ObjectId, ref: "Project", required:true },
    roleOnProject: { type: String, trim: true },
    addedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

ProjectMemberSchema.index({ member: 1, projectID: 1 }, { unique: true }); //Ensure same user can't be added twice to one project 

module.exports = mongoose.model("ProjectMember", ProjectMemberSchema);
