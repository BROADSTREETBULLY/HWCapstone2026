const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, trim: true, required: true, unique: true },
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    defaultOfficeId: {
      type: Schema.Types.ObjectId,
      ref: "Office",
    },
    role: { type: String, trim: true },
    firstName: { type: String, trim: true, required: true },
    lastName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true, unique: true, lowercase: true },
    password: { type: String, trim: true, required: true },
    userImage: { type: String, trim: true },
    admin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
