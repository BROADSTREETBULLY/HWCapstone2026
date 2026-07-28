// Everything to do with copying specs between the org library and schedules.
// This is the heart of the app, so the comments here are a bit longer.

const {
  Spec,
  SpecOption,
  SpecVersion,
  Schedule,
  ScheduleItem,
} = require("../models");


// helper so services can throw an error that already knows which HTTP status
// the route should send back (the route reads err.status)
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};


// Makes a brand new Spec + Option + Version that is a copy of an existing one.
// Used in both directions: library -> schedule, and schedule -> library.
// The copy is completely separate, so editing it never touches the original.
const cloneAsNewFamily = async ({
  srcSpec,
  srcVersion,
  ownerType,
  scheduleID,
  libraryID,
  userId,
}) => {
  const newSpec = await new Spec({
    orgId: srcSpec.orgId,
    ownerType,
    scheduleID: ownerType === "schedule" ? scheduleID : undefined,
    libraryID: libraryID || undefined, // set only for user-library copies
    category: srcSpec.category,
    subCategory: srcSpec.subCategory,
    createdBy: userId,
  }).save();

  const newOption = await new SpecOption({
    specID: newSpec._id,
    derivedFromVersionID: srcVersion._id, // breadcrumb in
    createdBy: userId,
  }).save();

  const newVersion = await new SpecVersion({
    optionID: newOption._id,
    supplierID: srcVersion.supplierID,
    versionNumber: 1,
    productName: srcVersion.productName,
    rawText: srcVersion.rawText,
    imageKey: srcVersion.imageKey,
    internalComments: srcVersion.internalComments,
    attributes: srcVersion.attributes,
    createdBy: userId,
  }).save();

  newOption.currentVersionID = newVersion._id;
  await newOption.save();

  return { newSpec, newOption, newVersion };
};


// PUSH TO ORG. Two different things can happen depending on the option:
//  1. it was copied FROM the library (has derivedFromVersionID) -> send the
//     edits back as a new version on the original, and this can be repeated
//  2. it was created fresh in a schedule -> clone it into the library as a
//     new spec, but only once (a second push returns 409)
const pushToLibraryInDB = async (optionID, userId) => {
  const option = await SpecOption.findById(optionID)
    .populate("specID")
    .populate("currentVersionID");
  if (!option) throw httpError(404, "Option not found");
  if (!option.currentVersionID)
    throw httpError(400, "Option has no version to push");

  //case 1: push edits back to the original
  if (option.derivedFromVersionID) {
    const srcVersion = await SpecVersion.findById(option.derivedFromVersionID);
    if (!srcVersion)
      throw httpError(404, "Original spec no longer exists in the library");

    const originalOption = await SpecOption.findById(srcVersion.optionID);
    if (!originalOption)
      throw httpError(404, "Original spec no longer exists in the library");

    const latest = await SpecVersion.findOne({ // find the highest version number so far
      optionID: originalOption._id,
    }).sort({ versionNumber: -1 });

    const copy = option.currentVersionID;
    const newVersion = await new SpecVersion({
      optionID: originalOption._id,
      supplierID: copy.supplierID,
      versionNumber: latest ? latest.versionNumber + 1 : 1,
      productName: copy.productName,
      rawText: copy.rawText,
      imageKey: copy.imageKey,
      internalComments: copy.internalComments,
      attributes: copy.attributes,
      createdBy: userId,
    }).save();

    originalOption.currentVersionID = newVersion._id;
    await originalOption.save();

    return { option: originalOption, version: newVersion, pushedBack: true };
  }


  //case 2: brand new spec born in a schedule - clone it into the library
  if (option.specID.ownerType !== "schedule")
    throw httpError(400, "Only schedule-owned specs can be pushed to the library");
  if (option.pushedAsOptionID)
    throw httpError(409, "This option has already been pushed to the library");

  const { newSpec, newOption, newVersion } = await cloneAsNewFamily({
    srcSpec: option.specID,
    srcVersion: option.currentVersionID,
    ownerType: "library",
    userId,
  });

  option.pushedAsOptionID = newOption._id; // breadcrumb out
  await option.save();

  return { spec: newSpec, option: newOption, version: newVersion };
};


// Adds a library spec to a schedule. It does NOT point the schedule row at the
// library spec - it clones a project-local copy first, so edits made on the
// project can't change the org library by accident.
const addFromLibraryInDB = async (scheduleID, optionID, itemData, userId) => {
  const schedule = await Schedule.findById(scheduleID);
  if (!schedule) throw httpError(404, "Schedule not found");

  const libOption = await SpecOption.findById(optionID)
    .populate("specID")
    .populate("currentVersionID");
  if (!libOption) throw httpError(404, "Option not found");
  if (!libOption.currentVersionID)
    throw httpError(400, "Library option has no current version");
  if (libOption.specID.ownerType !== "library")
    throw httpError(400, "Only library-owned specs can be added from the library");

  const { newSpec, newOption, newVersion } = await cloneAsNewFamily({
    srcSpec: libOption.specID,
    srcVersion: libOption.currentVersionID,
    ownerType: "schedule",
    scheduleID,
    userId,
  });

  const item = await new ScheduleItem({
    scheduleID,
    optionID: newOption._id,
    itemCode: itemData?.itemCode,
    itemComments: itemData?.itemComments,
    sortOrder: itemData?.sortOrder,
    createdBy: userId,
  }).save();

  return { item, spec: newSpec, option: newOption, version: newVersion };
};

module.exports = { cloneAsNewFamily, pushToLibraryInDB, addFromLibraryInDB };
