const {
  getLibrary,
  getOne,
  createOne,
  updateOne,
  deleteOne,
} = require("../services/specServices");
const {
  createOptionInDB,
  getOptionsForSpecInDB,
  getOptionInDB,
  updateOptionInDB,
} = require("../services/specOptionServices");
const {
  createVersionInDB,
  getVersionsForOptionInDB,
  getVersionInDB,
} = require("../services/specVersionServices");



const createSpec = async (specBody, userId) => {
  if (!specBody || typeof specBody !== "object") {
    throw new Error("Invalid request body: missing spec data");
  }
  const spec = await createOne({ ...specBody, createdBy: userId });
  return spec;
};

const querySpecLibrary = async (queryBody) => {
  const paginationModel = queryBody?.paginationModel || { page: 0, pageSize: 25 };
  const result = await getLibrary({
    paginationModel,
    filterModel: queryBody?.filterModel,
    sortModel: queryBody?.sortModel,
  });
  return result;
};

const getSpec = async (id) => {
  const spec = await getOne(id);
  return spec;
};

const updateSpec = async (id, specBody, userId) => {
  const spec = await updateOne(id, { ...specBody, updatedBy: userId });
  return spec;
};

const deleteSpec = async (id) => {
  await deleteOne(id);
};


const createOption = async (specID, optionBody, userId) => {
  const option = await createOptionInDB(specID, optionBody || {}, userId);
  return option;
};

const getOptionsForSpec = async (specID) => {
  const options = await getOptionsForSpecInDB(specID);
  return options;
};

const getOption = async (optionID) => {
  const option = await getOptionInDB(optionID);
  return option;
};

const updateOption = async (optionID, optionBody) => {
  const option = await updateOptionInDB(optionID, optionBody || {});
  return option;
};


const createVersion = async (optionID, versionBody, userId) => {
  if (!versionBody || typeof versionBody !== "object") {
    throw new Error("Invalid request body: missing version data");
  }
  const version = await createVersionInDB(optionID, versionBody, userId);
  return version;
};

const getVersionsForOption = async (optionID) => {
  const versions = await getVersionsForOptionInDB(optionID);
  return versions;
};

const getVersion = async (versionID) => {
  const version = await getVersionInDB(versionID);
  return version;
};


module.exports = {
  createSpec,
  querySpecLibrary,
  getSpec,
  updateSpec,
  deleteSpec,
  createOption,
  getOptionsForSpec,
  getOption,
  updateOption,
  createVersion,
  getVersionsForOption,
  getVersion,
};
