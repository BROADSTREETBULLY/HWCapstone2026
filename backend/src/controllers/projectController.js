const {
  createProjectInDB,
  getProjectsInDB,
  getProjectInDB,
  updateProjectInDB,
  deleteProjectInDB,
} = require("../services/projectServices");

const createProject = async (projectBody, userId) => {
  if (!projectBody || typeof projectBody !== "object") {
    throw new Error("Invalid request body: missing project data");
  }
  if (!projectBody.projectName || !projectBody.projectNumber) {
    throw new Error(
      "Invalid request body: projectName and projectNumber are required",
    );
  }
  const project = await createProjectInDB(projectBody, userId);
  return project;
};

const getProjects = async (userId) => {
  const projects = await getProjectsInDB(userId);
  return projects;
};

const getProject = async (projectID) => {
  const project = await getProjectInDB(projectID);
  return project;
};

const updateProject = async (projectID, projectBody, userId) => {
  const project = await updateProjectInDB(projectID, projectBody || {}, userId);
  return project;
};

const deleteProject = async (projectID) => {
  await deleteProjectInDB(projectID);
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
