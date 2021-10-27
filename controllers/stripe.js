const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const { round } = require("lodash");

const stripe = require("stripe")(process.env.STRIPE_SECRET);

exports.createPaymentIntent = async (req, res) => {
  const {
    user: { email },
  } = req;
  // apply coupon
  // calculate price
  // 1 find user
  const user = await User.findOne({ email }).exec();
  // 2 get user cart total
  const cart = await Cart.findOne({ orderedBy: user._id }).exec();

  console.log(cart);

  // 3 create payment intent with order amount and currency
  if (cart.totalAfterDiscount) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: round(cart.totalAfterDiscount * 100),
      currency: "usd",
    });
    return res.json({
      clientSecret: paymentIntent.client_secret,
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: round(cart.cartTotal * 100),
    currency: "usd",
  });
  return res.json({
    clientSecret: paymentIntent.client_secret,
    cartTotal: round(cart.cartTotal, 2),
    totalAfterDiscount: round(cart.totalAfterDiscount, 2),
  });
};
