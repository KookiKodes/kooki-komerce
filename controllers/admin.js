const Order = require("../models/order");

exports.orders = async (req, res) => {
  try {
    const allOrders = await Order.find({})
      .sort("createAt")
      .populate("products.product")
      .exec();
    res.json(allOrders);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};

exports.orderStatus = async (req, res) => {
  const { orderId, orderStatus } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    )
      .populate("products.product")
      .exec();
    console.log(updatedOrder);
    res.json(updatedOrder);
  } catch ({ message }) {
    console.log(message);
    res.status(400).json({ message });
  }
};
