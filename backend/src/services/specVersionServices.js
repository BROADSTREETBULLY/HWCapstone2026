const { SpecVersion, SpecOption } = require("../models");

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
    attributes: data.attributes || [],
    createdBy: userId,
  }).save();

  option.currentVersionID = version._id;
  await option.save();

  return version;
};

const getVersionsForOptionInDB = async (optionID) => {
  const versions = await SpecVersion.find({ optionID }).sort({
    versionNumber: -1,
  });
  return versions;
};

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