const Coupon = require("../models/coupon");

exports.create = async (req, res) => {
  try {
    const { name, expiration, discount } = req.body;
    const coupon = await new Coupon({ name, expiration, discount }).save();
    res.json({ coupon });
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};
exports.list = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 }).exec();
    res.json(coupons);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id).exec();
    res.json(coupon);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};
