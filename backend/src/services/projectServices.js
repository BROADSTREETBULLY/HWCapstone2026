const { Project, User } = require("../models");

//create a new project - orgId is derived from the logged-in user
const createProjectInDB = async (data, userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const project = await new Project({
    orgId: user.orgId,
    officeId: data.officeId,
    projectName: data.projectName,
    projectNumber: data.projectNumber,
    projectAddress: data.projectAddress,
    projectDescription: data.projectDescription,
    projectComments: data.projectComments,
    projectImage: data.projectImage,
    projectLead: data.projectLead,
    createdBy: userId,
  }).save();
  return project;
};

//get all projects for the user's org, most recently updated first
const getProjectsInDB = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const projects = await Project.find({ orgId: user.orgId }).sort({
    updatedAt: -1,
  });
  return projects;
};

//get one project by id
const getProjectInDB = async (projectID) => {
  const project = await Project.findById(projectID);
  if (!project) throw new Error("Project not found");
  return project;
};

//update a project by id
const updateProjectInDB = async (projectID, data, userId) => {
  const allowed = { updatedBy: userId };
  const fields = [
    "officeId",
    "projectName",
    "projectNumber",
    "projectAddress",
    "projectDescription",
    "projectComments",
    "projectImage",
    "projectLead",
  ];
  fields.forEach((field) => {
    if (data[field] !== undefined) allowed[field] = data[field];
  });

  const project = await Project.findByIdAndUpdate(projectID, allowed, {
    returnDocument: "after",
  });
  if (!project) throw new Error("Project not found");
  return project;
};

//delete a project by id
const deleteProjectInDB = async (projectID) => {
  const deleted = await Project.findByIdAndDelete(projectID);
  if (!deleted) throw new Error("Project not found");
};

module.exports = {
  createProjectInDB,
  getProjectsInDB,
  getProjectInDB,
  updateProjectInDB,
  deleteProjectInDB,
};
