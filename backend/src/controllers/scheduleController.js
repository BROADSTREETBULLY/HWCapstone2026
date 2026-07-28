// Controllers for schedules and the rows inside them.

const {
  createScheduleInDB,
  getSchedulesInDB,
  getScheduleInDB,
  updateScheduleInDB,
  deleteScheduleInDB,
} = require("../services/scheduleServices");
const {
  createItemWithSpecInDB,
  getItemsForScheduleInDB,
  getItemInDB,
  updateItemInDB,
  deleteItemInDB,
} = require("../services/scheduleItemServices");
const { addFromLibraryInDB } = require("../services/pushServices");


const createSchedule = async (scheduleBody, userId) => {
  if (!scheduleBody || typeof scheduleBody !== "object") {
    throw new Error("Invalid request body: missing schedule data");
  }
  const schedule = await createScheduleInDB(scheduleBody, userId);
  return schedule;
};

const getSchedules = async (projectID) => {
  const schedules = await getSchedulesInDB(projectID);
  return schedules;
};

const getSchedule = async (scheduleID) => {
  const schedule = await getScheduleInDB(scheduleID);
  return schedule;
};

const updateSchedule = async (scheduleID, scheduleBody, userId) => {
  const schedule = await updateScheduleInDB(scheduleID, scheduleBody, userId);
  return schedule;
};

const deleteSchedule = async (scheduleID) => {
  await deleteScheduleInDB(scheduleID);
};

//items
const createItemWithSpec = async (scheduleID, itemBody, userId) => {
  if (!itemBody || typeof itemBody !== "object") {
    throw new Error("Invalid request body: missing item data");
  }
  const result = await createItemWithSpecInDB(scheduleID, itemBody, userId);
  return result;
};


const getItemsForSchedule = async (scheduleID) => {
  const items = await getItemsForScheduleInDB(scheduleID);
  return items;
};

const getItem = async (itemID) => {
  const item = await getItemInDB(itemID);
  return item;
};

const updateItem = async (itemID, itemBody, userId) => {
  const item = await updateItemInDB(itemID, itemBody || {}, userId);
  return item;
};

const deleteItem = async (itemID) => {
  await deleteItemInDB(itemID);
};

const addItemFromLibrary = async (scheduleID, itemBody, userId) => {
  if (!itemBody?.optionID) {
    throw new Error("Invalid request body: optionID is required");
  }
  const result = await addFromLibraryInDB(
    scheduleID,
    itemBody.optionID,
    itemBody,
    userId,
  );
  return result;
};

module.exports = {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  createItemWithSpec,
  getItemsForSchedule,
  getItem,
  updateItem,
  deleteItem,
  addItemFromLibrary,
};
