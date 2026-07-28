// An invite for someone to join an organisation.
// Built for future multi-user sign-up - no routes use it yet.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InviteSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    email: { type: String, trim: true, required: true, lowercase: true },
    role: { type: String, trim: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invite", InviteSchema);