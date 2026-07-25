const {
  ScheduleItem,
  Schedule,
  Spec,
  SpecOption,
  SpecVersion,
} = require("../models");

const { parseSpecText } = require("./specTextParser");

const createItemWithSpecInDB = async (scheduleID, data, userId) => {
  const schedule = await Schedule.findById(scheduleID);
  if (!schedule) throw new Error("Schedule not found");

  const spec = await new Spec({
    orgId: data.orgId,
    ownerType: "schedule",
    scheduleID,
    category: data.category,
    subCategory: data.subCategory,
    createdBy: userId,
  }).save();

  const option = await new SpecOption({
    specID: spec._id,
    createdBy: userId,
  }).save();

  const version = await new SpecVersion({
    optionID: option._id,
    supplierID: data.supplierID,
    versionNumber: 1,
    productName: data.productName,
    rawText: data.rawText,
    imageKey: data.imageKey,
    internalComments: data.internalComments,
    attributes: data.attributes || parseSpecText(data.rawText),
    createdBy: userId,
  }).save();

  option.currentVersionID = version._id;
  await option.save();

  const item = await new ScheduleItem({
    scheduleID,
    optionID: option._id,
    itemCode: data.itemCode,
    itemComments: data.itemComments,
    sortOrder: data.sortOrder,
    createdBy: userId,
  }).save();

  return { item, spec, option, version };
};

const getItemsForScheduleInDB = async (scheduleID) => {
  const items = await ScheduleItem.find({ scheduleID })
    .populate({
      path: "optionID",
      populate: [{ path: "currentVersionID" }, { path: "specID" }],
    })
    .sort({ sortOrder: 1, createdAt: 1 });
  return items;
};

const getItemInDB = async (itemID) => {
  const item = await ScheduleItem.findById(itemID).populate({
    path: "optionID",
    populate: [{ path: "currentVersionID" }, { path: "specID" }],
  });
  if (!item) throw new Error("Schedule item not found");
  return item;
};

const updateItemInDB = async (itemID, data, userId) => {
  const allowed = {
    updatedBy: userId,
  };
  if (data.itemCode !== undefined) allowed.itemCode = data.itemCode;
  if (data.itemComments !== undefined) allowed.itemComments = data.itemComments;
  if (data.sortOrder !== undefined) allowed.sortOrder = data.sortOrder;

  const item = await ScheduleItem.findByIdAndUpdate(itemID, allowed, {
    returnDocument: "after",
  });
  if (!item) throw new Error("Schedule item not found");
  return item;
};

const deleteItemInDB = async (itemID) => {
  const deleted = await ScheduleItem.findByIdAndDelete(itemID);
  if (!deleted) throw new Error("Schedule item not found");
};

module.exports = {
  createItemWithSpecInDB,
  getItemsForScheduleInDB,
  getItemInDB,
  updateItemInDB,
  deleteItemInDB,
};
