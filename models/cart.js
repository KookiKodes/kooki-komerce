const { Schema, model } = require("mongoose");
const { ObjectId } = Schema;

const cartSchema = new Schema(
  {
    products: [
      {
        product: {
          type: Schema.ObjectId,
          ref: "Product",
        },
        count: {
          type: Number,
          min: 1,
        },
        color: String,
        price: Number,
      },
    ],
    cartTotal: Number,
    totalAfterDiscount: Number,
    appliedCoupon: {
      type: Schema.ObjectId,
      ref: "Coupon",
    },
    orderedBy: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("Cart", cartSchema);
