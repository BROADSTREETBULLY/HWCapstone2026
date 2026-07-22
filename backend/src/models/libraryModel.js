const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LibrarySchema = new Schema(
  {
    userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Library", LibrarySchema);