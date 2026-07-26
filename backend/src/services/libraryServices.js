const { Library, LibraryItem } = require("../models");

const createLibraryInDB = async (data, userId) => {
  const library = await new Library({
    userID: userId,
    name: data.name,
    description: data.description,
  }).save();
  return library;
};

const getLibrariesInDB = async (userId) => {
  const libraries = await Library.find({ userID: userId }).sort({
    createdAt: -1,
  });
  return libraries;
};

const updateLibraryInDB = async (libraryID, data) => {
  const library = await Library.findByIdAndUpdate(
    libraryID,
    { name: data.name, description: data.description },
    { returnDocument: "after" },
  );
  if (!library) throw new Error("Library not found");
  return library;
};

const deleteLibraryInDB = async (libraryID) => {
  await LibraryItem.deleteMany({ libraryID }); 
  const deleted = await Library.findByIdAndDelete(libraryID);
  if (!deleted) throw new Error("Library not found");
};


const addLibraryItemInDB = async (libraryID, optionID, sortOrder) => {
  const existing = await LibraryItem.findOne({ libraryID, optionID });
  if (existing) throw new Error("Option is already in this library");
  const item = await new LibraryItem({ libraryID, optionID, sortOrder }).save();
  return item;
};

const getLibraryItemsInDB = async (libraryID) => {
  const items = await LibraryItem.find({ libraryID })
    .populate({
      path: "optionID",
      populate: [{ path: "currentVersionID" }, { path: "specID" }],
    })
    .sort({ sortOrder: 1, createdAt: 1 });
  return items;
};

const removeLibraryItemInDB = async (libraryItemID) => {
  const deleted = await LibraryItem.findByIdAndDelete(libraryItemID);
  if (!deleted) throw new Error("Library item not found");
};

module.exports = {
  createLibraryInDB,
  getLibrariesInDB,
  updateLibraryInDB,
  deleteLibraryInDB,
  addLibraryItemInDB,
  getLibraryItemsInDB,
  removeLibraryItemInDB,
};
