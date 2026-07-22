const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OfficeSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    officeName: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

OfficeSchema.index({ orgId: 1, officeName: 1 }, { unique: true });

module.exports = mongoose.model("Office", OfficeSchema);