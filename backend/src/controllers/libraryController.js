// Controllers for user libraries and their items.

const {
  createLibraryInDB,
  getLibrariesInDB,
  updateLibraryInDB,
  deleteLibraryInDB,
  addLibraryItemInDB,
  getLibraryItemsInDB,
  removeLibraryItemInDB,
} = require("../services/libraryServices");


const createLibrary = async (libraryBody, userId) => {
  if (!libraryBody?.name) {
    throw new Error("Invalid request body: name is required");
  }
  const library = await createLibraryInDB(libraryBody, userId);
  return library;
};

const getLibraries = async (userId) => {
  const libraries = await getLibrariesInDB(userId);
  return libraries;
};

const updateLibrary = async (libraryID, libraryBody, userId) => {
  const library = await updateLibraryInDB(libraryID, libraryBody || {}, userId);
  return library;
};

const deleteLibrary = async (libraryID, userId) => {
  await deleteLibraryInDB(libraryID, userId);
};

const addLibraryItem = async (libraryID, itemBody, userId) => {
  if (!itemBody?.optionID) {
    throw new Error("Invalid request body: optionID is required");
  }
  const item = await addLibraryItemInDB(
    libraryID,
    itemBody.optionID,
    itemBody.sortOrder,
    userId,
  );
  return item;
};

const getLibraryItems = async (libraryID, userId) => {
  const items = await getLibraryItemsInDB(libraryID, userId);
  return items;
};

const removeLibraryItem = async (libraryItemID, userId) => {
  await removeLibraryItemInDB(libraryItemID, userId);
};

module.exports = {
  createLibrary,
  getLibraries,
  updateLibrary,
  deleteLibrary,
  addLibraryItem,
  getLibraryItems,
  removeLibraryItem,
};
