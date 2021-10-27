const User = require("../models/user");
const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const Coupon = require("../models/coupon");
const _ = require("lodash");
const pipe = require("pipe-functions");

exports.userCart = async (req, res) => {
  const { cart } = req.body;
  const {
    user: { email },
  } = req;

  try {
    const user = await User.findOne({ email }).exec();

    // check if cart with logged in user id already exists
    const cartExists = await Cart.findOne({ orderedBy: user._id }).exec();

    if (cartExists) {
      cartExists.remove();
      console.log("Removed old cart");
    }

    const newCart = { products: [], cartTotal: 0 };
    for (let item of cart) {
      const { price } = await Product.findById(item._id).select("price");
      newCart.products.push({
        product: item._id,
        count: item.count,
        color: item.color,
        price,
      });
      newCart.cartTotal += price * item.count;
    }

    const finalCart = await new Cart({
      ...newCart,
      orderedBy: user._id,
    }).save();

    console.log("final cart", finalCart);

    res.json({ success: true, cart: finalCart });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

exports.getUserCart = async (req, res) => {
  const {
    user: { email },
  } = req;
  const user = await User.findOne({ email }).exec();
  const cart = await Cart.findOne({ orderedBy: user._id })
    .populate("products.product", "title price _id")
    .populate("appliedCoupon", "name discount")
    .exec();
  res.json(cart || {});
};

exports.emptyCart = async (req, res) => {
  const {
    user: { email },
  } = req;

  try {
    const user = await User.findOne({ email }).exec();
    const cart = await Cart.findOneAndRemove({ orderedBy: user._id }).exec();
    res.json(cart);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

exports.saveAddress = async (req, res) => {
  try {
    const {
      user: { email },
      body: { address },
    } = req;
    const user = await User.findOneAndUpdate({ email }, { address }).exec();
    console.log("address saved", user.address);
    res.json({ success: true, address: user.address });
  } catch ({ message }) {
    console.log(message);
    res.json({ success: false, message });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const {
      user: { email },
    } = req;
    const user = await User.findOne({ email }).exec();
    console.log("get address", user.address);
    if (user.address) {
      return res.json({ success: true, address: user.address });
    }
    return res.json({ success: false, address: {} });
  } catch ({ message }) {
    console.log(message);
    res.json({ success: false, message });
  }
};

const divide = (by) => (num) => _.divide(num, by);
const multiply = (by) => (num) => _.multiply(num, by);
const subtract = (num) => (by) => _.subtract(num, by);
const round = (percision) => (num) => _.round(num, percision);
const calcTotal = (curTotal, discount) =>
  pipe(curTotal, multiply(discount), divide(100), subtract(curTotal), round(2));

exports.applyCoupon = async (req, res) => {
  const {
    user: { email },
    body: { coupon },
  } = req;
  console.log("coupon", coupon);

  const validCoupon = await Coupon.findOne({ name: coupon }).exec();

  if (!validCoupon) return res.json({ message: "Coupon not found" });

  try {
    const user = await User.findOne({ email }).exec();
    const cart = await Cart.findOne({ orderedBy: user._id })
      .populate("products.product", "_id title price")
      .exec();
    const totalAfterDiscount = calcTotal(cart.cartTotal, validCoupon.discount);
    await Cart.findByIdAndUpdate(
      cart._id,
      {
        totalAfterDiscount,
        appliedCoupon: validCoupon,
      },
      { new: true }
    );
    res.json({ totalAfterDiscount, appliedCoupon: validCoupon });
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.removeCoupon = async (req, res) => {
  const {
    user: { email },
  } = req;
  try {
    const user = await User.findOne({ email }).exec();
    const cart = await Cart.findOneAndUpdate(
      { orderedBy: user._id },
      { appliedCoupon: null, totalAfterDiscount: null },
      { new: true }
    ).exec();
    res.json(cart);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.createOrder = async (req, res) => {
  const {
    user: { email },
    body: {
      stripeResponse: { paymentIntent },
    },
  } = req;

  try {
    const user = await User.findOne({ email }).exec();
    const cart = await Cart.findOne({ orderedBy: user._id }).exec();
    const newOrder = await new Order({
      products: cart.products,
      paymentIntent,
      orderedBy: user._id,
    }).save();

    // decrement quantity and increment sold
    const bulkOption = cart.products.map((item) => {
      return {
        updateOne: {
          filter: {
            _id: item.product._id, // IMPORTANT item.product
          },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    const productUpdated = await Product.bulkWrite(bulkOption, {});
    console.log("Product Update", productUpdated);

    if (newOrder) {
      return res.json({ order: newOrder, success: true });
    }
    return res.json({ success: false });
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message, success: false });
  }
};

exports.getOrders = async (req, res) => {
  const {
    user: { email },
  } = req;
  try {
    const user = await User.findOne({ email }).exec();
    const orders = await Order.find({ orderedBy: user._id })
      .populate("products.product", "_id title brand price shipping")
      .exec();
    res.json(orders);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.wishlist = async (req, res) => {
  const {
    user: { email },
  } = req;
  try {
    const wishlist = await User.findOne({ email })
      .select("wishlist")
      .populate("wishlist")
      .exec();
    res.json(wishlist.wishlist);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.addToWishlist = async (req, res) => {
  const {
    user: { email },
    body: { productId },
  } = req;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { wishlist: productId } },
      { new: true }
    )
      .populate("wishlist")
      .exec();

    res.json(user.wishlist);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const {
    user: { email },
    params: { productId },
  } = req;
  try {
    const wishlist = await User.findOneAndUpdate(
      { email },
      { $pull: { wishlist: productId } },
      { new: true }
    )
      .select("wishlist")
      .populate("wishlist")
      .exec();
    res.json(wishlist.wishlist);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.isWishlisted = async (req, res) => {
  const {
    params: { productId },
  } = req;
  try {
    const wishlist = await User.findOne({
      wishlist: { $all: { _id: productId } },
    }).exec();
    if (wishlist) return res.json(true);
    return res.json(false);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};
