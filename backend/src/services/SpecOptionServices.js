// Options are the variants of a spec (same chair, different colour).

const { SpecOption, Spec } = require("../models");

// make a new option under a spec. It has no version yet - the caller adds one
// straight after, which is what actually gives it text.
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
// all the options for one spec, oldest first, with the live version filled in
// so the frontend can show each option's text and image
const getOptionsForSpecInDB = async (specID) => {
  const options = await SpecOption.find({ specID })
    .populate("currentVersionID")
    .sort({ createdAt: 1 });
  return options;
};

// one option on its own
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
    returnDocument: "after",
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
