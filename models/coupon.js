const { Schema, model } = require("mongoose");
const { ObjectId } = Schema;

const couponSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: true,
      uppercase: true,
      required: true,
      minlength: [6, "Too short"],
      maxlength: [12, "Too long"],
    },
    expiration: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Coupon", couponSchema);
