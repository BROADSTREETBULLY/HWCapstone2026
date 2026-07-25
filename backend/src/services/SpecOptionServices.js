const { SpecOption, Spec } = require("../models");

const createOptionInDB = async (specID, data, userId) => {
  const spec = await Spec.findById(specID);
  if (!spec) throw new Error("Spec not found");

  const option = await new SpecOption({
    specID,
    derivedFromVersionID: data.derivedFromVersionID,
    createdBy: userId,
  }).save();
  return option;
};
const getOptionsForSpecInDB = async (specID) => {
  const options = await SpecOption.find({ specID })
    .populate("currentVersionID")
    .sort({ createdAt: 1 });
  return options;
};

const getOptionInDB = async (optionID) => {
  const option = await SpecOption.findById(optionID)
    .populate("currentVersionID")
    .populate("specID");
  if (!option) throw new Error("Option not found");
  return option;
};

const updateOptionInDB = async (optionID, data) => {
  const allowed = {};
  if (data.isRedundant !== undefined) allowed.isRedundant = data.isRedundant;
  const option = await SpecOption.findByIdAndUpdate(optionID, allowed, {
    new: true,
  });
  if (!option) throw new Error("Option not found");
  return option;
};

module.exports = {
  createOptionInDB,
  getOptionsForSpecInDB,
  getOptionInDB,
  updateOptionInDB,
};
