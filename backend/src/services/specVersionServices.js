// Versions hold the actual spec text and are never edited once created.

const { SpecVersion, SpecOption } = require("../models");
const { parseSpecText } = require("./specTextParser");

// Adds a NEW version to an option - this is how every edit is saved.
// Nothing is overwritten: the new version gets the next version number and the
// option's currentVersionID pointer is moved to it at the end.
const createVersionInDB = async (optionID, data, userId) => {
  const option = await SpecOption.findById(optionID);
  if (!option) throw new Error("Option not found");

    const latest = await SpecVersion.findOne({ optionID }).sort({
    versionNumber: -1,
  });

  const version = await new SpecVersion({
    optionID,
    supplierID: data.supplierID,
    versionNumber: latest ? latest.versionNumber + 1 : 1,
    productName: data.productName,
    rawText: data.rawText,
    imageKey: data.imageKey,
    internalComments: data.internalComments,
    attributes: data.attributes || parseSpecText(data.rawText), // use given attributes, or work them out from the text
    createdBy: userId,
  }).save();

  option.currentVersionID = version._id;
  await option.save();

  return version;
};

// full history for one option, newest first (used by the Previous Versions modal)
const getVersionsForOptionInDB = async (optionID) => {
  const versions = await SpecVersion.find({ optionID }).sort({
    versionNumber: -1,
  });
  return versions;
};

// one version on its own
const getVersionInDB = async (versionID) => {
  const version = await SpecVersion.findById(versionID).populate("supplierID");
  if (!version) throw new Error("Version not found");
  return version;
};

module.exports = {
  createVersionInDB,
  getVersionsForOptionInDB,
  getVersionInDB,
};