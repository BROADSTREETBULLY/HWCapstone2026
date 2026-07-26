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

const updateLibrary = async (libraryID, libraryBody) => {
  const library = await updateLibraryInDB(libraryID, libraryBody || {});
  return library;
};

const deleteLibrary = async (libraryID) => {
  await deleteLibraryInDB(libraryID);
};

const addLibraryItem = async (libraryID, itemBody) => {
  if (!itemBody?.optionID) {
    throw new Error("Invalid request body: optionID is required");
  }
  const item = await addLibraryItemInDB(
    libraryID,
    itemBody.optionID,
    itemBody.sortOrder,
  );
  return item;
};

const getLibraryItems = async (libraryID) => {
  const items = await getLibraryItemsInDB(libraryID);
  return items;
};

const removeLibraryItem = async (libraryItemID) => {
  await removeLibraryItemInDB(libraryItemID);
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
