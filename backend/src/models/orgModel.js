// An organisation = one design practice. Everything in the app (projects,
// specs, libraries) belongs to an org so practices never see each other's data.
// The billing/subscription fields are here for future use - not used yet.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrgSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orgName: { type: String, trim: true, required: true },
    sectors: { type: String, trim: true },
    phone: { type: String, trim: true },
    orgImage: { type: String, trim: true },
    subscriptionPlan: {
      type: String,
      enum: ["trial", "pro"],
      default: "trial",
    },
    seatsLimit: { type: Number, default: 10 },
    discountRate: { type: Number, default: 0 },
    billingContact: { type: String, trim: true },
    billingEmail: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    subscriptionStatus: {
      type: String,
      enum: ["trial", "active", "past_due", "cancelled"],
      default: "trial",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Organisation", OrgSchema);
