const { Schema, model } = require("mongoose");
const { Role } = require("../enums/Role");
const { ObjectId } = Schema;

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: Number,
      enums: [],
      default: Role.GUEST,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: {
      type: Object,
      properties: {
        country: {
          type: String,
          length: 2,
        },
        fullName: String,
        street: String,
        other: String,
        zipCode: Number,
        state: {
          type: String,
          length: 2,
        },
        city: String,
      },
    },
    wishlist: [{ type: ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
