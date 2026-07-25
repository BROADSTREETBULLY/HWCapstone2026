const { Schedule } = require("../models");

const createScheduleInDB = async (data, userId) => {
  const schedule = await new Schedule({
    projectID: data.projectID,
    scheduleType: data.scheduleType,
    scheduleTitle:
      data.scheduleTitle || `${data.scheduleType} Schedule`, 
    scheduleStatus: data.scheduleStatus,
    scheduleDescription: data.scheduleDescription,
    scheduleComments: data.scheduleComments,
    createdBy: userId,
  }).save();
  return schedule;
};

const getSchedulesInDB = async (projectID) => {
  const query = projectID ? { projectID } : {};
  const schedules = await Schedule.find(query).sort({ createdAt: -1 });
  return schedules;
};

const getScheduleInDB = async (scheduleID) => {
  const schedule = await Schedule.findById(scheduleID);
  if (!schedule) throw new Error("Schedule not found");
  return schedule;
};

const updateScheduleInDB = async (scheduleID, data, userId) => {
  const schedule = await Schedule.findByIdAndUpdate(
    scheduleID,
    { ...data, updatedBy: userId },
    { returnDocument: "after" },
  );
  if (!schedule) throw new Error("Schedule not found");
  return schedule;
};

const deleteScheduleInDB = async (scheduleID) => {
  const deleted = await Schedule.findByIdAndDelete(scheduleID);
  if (!deleted) throw new Error("Schedule not found");
};

module.exports = {
  createScheduleInDB,
  getSchedulesInDB,
  getScheduleInDB,
  updateScheduleInDB,
  deleteScheduleInDB,
};
