const { Library, LibraryItem, SpecOption } = require("../models");
const { cloneAsNewFamily } = require("./pushServices");


const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};


const getOwnedLibrary = async (libraryID, userId) => {
  const library = await Library.findById(libraryID);
  if (!library || String(library.userID) !== String(userId)) {
    throw httpError(404, "Library not found");
  }
  return library;
};

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


const updateLibraryInDB = async (libraryID, data, userId) => {
  await getOwnedLibrary(libraryID, userId);
  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  const library = await Library.findByIdAndUpdate(libraryID, updates, {
    new: true,
  });
  return library;
};

const deleteLibraryInDB = async (libraryID, userId) => {
  await getOwnedLibrary(libraryID, userId);
  await LibraryItem.deleteMany({ libraryID }); 
  await Library.findByIdAndDelete(libraryID);
};


const addLibraryItemInDB = async (libraryID, optionID, sortOrder, userId) => {
  await getOwnedLibrary(libraryID, userId);

  const srcOption = await SpecOption.findById(optionID)
    .populate("specID")
    .populate("currentVersionID");
  if (!srcOption) throw httpError(404, "Option not found");
  if (!srcOption.currentVersionID)
    throw httpError(400, "Option has no current version");
  if (srcOption.specID.ownerType !== "library")
    throw httpError(400, "Only library-owned specs can be added to a user library");

  const { newOption } = await cloneAsNewFamily({
    srcSpec: srcOption.specID,
    srcVersion: srcOption.currentVersionID,
    ownerType: "library",
    libraryID, 
    userId,
  });

  const item = await new LibraryItem({
    libraryID,
    optionID: newOption._id,
    sortOrder,
  }).save();
  return item;
};

const getLibraryItemsInDB = async (libraryID, userId) => {
  await getOwnedLibrary(libraryID, userId);
  const items = await LibraryItem.find({ libraryID })
    .populate({
      path: "optionID",
      populate: [{ path: "currentVersionID" }, { path: "specID" }],
    })
    .sort({ sortOrder: 1, createdAt: 1 });
  return items;
};

const removeLibraryItemInDB = async (libraryItemID, userId) => {
  const item = await LibraryItem.findById(libraryItemID);
  if (!item) throw httpError(404, "Library item not found");
  await getOwnedLibrary(item.libraryID, userId);
  await LibraryItem.findByIdAndDelete(libraryItemID);
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
