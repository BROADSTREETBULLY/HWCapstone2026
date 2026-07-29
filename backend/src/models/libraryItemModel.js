// One spec sitting inside a user library. Points at an option, same as a
// schedule row does. The option it points at is an editable COPY, so editing
// it never changes the org library original.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LibraryItemSchema = new Schema(
  {
    libraryID: { type: Schema.Types.ObjectId, ref: "Library", required: true },
    optionID: { type: Schema.Types.ObjectId, ref: "SpecOption", required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

LibraryItemSchema.index({ libraryID: 1, optionID: 1 }, { unique: true }); // no duplicate entries in one library

module.exports = mongoose.model("LibraryItem", LibraryItemSchema);