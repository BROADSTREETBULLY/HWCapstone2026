const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SupplierContactSchema = new Schema(
  {
    supplierID: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
    officeID: { type: Schema.Types.ObjectId, ref: "Office" }, // null = default contact
    isActive: { type: Boolean, default: true },
    contactName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("SupplierContact", SupplierContactSchema);