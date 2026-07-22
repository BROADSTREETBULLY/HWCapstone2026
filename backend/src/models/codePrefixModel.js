const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CodePrefixSchema = new Schema({

  orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
  prefix:  { type: String, trim: true, required: true, uppercase: true },
  subCategory: { type: String, trim: true, required: true },

});

CodePrefixSchema.index({ orgId: 1, prefix: 1 }, { unique: true });

module.exports = mongoose.model("CodePrefix", CodePrefixSchema);
