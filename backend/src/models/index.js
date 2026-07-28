// One place to import all the models from, so other files can do
// const { User, Spec } = require("../models") instead of a require per model.

"use strict";
module.exports = {
  User: require("./userModel"),
  Spec: require("./specModel"),
  SpecOption: require("./specOptModel"),
  SpecVersion: require("./specVerModel"),
  Schedule: require("./scheduleModel"),
  ScheduleItem: require("./scheduleItemModel"),
  Library: require("./libraryModel"),
  LibraryItem: require("./libraryItemModel"),
  Project: require("./projectModel"),
};
