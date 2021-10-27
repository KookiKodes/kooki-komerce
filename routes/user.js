const { Router } = require("express");

const router = Router();

// middlewares
const { authCheck } = require("../middlewares/auth");

// controller
const { createOrUpdateUser } = require("../controllers/auth");
const {
  userCart,
  getUserCart,
  emptyCart,
  saveAddress,
  getAddress,
  applyCoupon,
  removeCoupon,
  createOrder,
  getOrders,
  addToWishlist,
  wishlist,
  removeFromWishlist,
  isWishlisted,
} = require("../controllers/user");

router.get("/user", createOrUpdateUser);
router.get("/user/cart", authCheck, getUserCart); // saveCart
router.post("/user/cart", authCheck, userCart); // saveCart
router.delete("/user/cart", authCheck, emptyCart); // saveCart
router.post("/user/address", authCheck, saveAddress); // saveCart
router.get("/user/address", authCheck, getAddress); // saveCart

// coupon
router.post("/user/coupon/apply", authCheck, applyCoupon); // saveCart
router.delete("/user/coupon/remove", authCheck, removeCoupon); // saveCart

// order
router.post("/user/order", authCheck, createOrder);
router.get("/user/orders", authCheck, getOrders);

// wishlist
router.post("/user/wishlist", authCheck, addToWishlist);
router.get("/user/wishlist/:productId", authCheck, isWishlisted);
router.get("/user/wishlist", authCheck, wishlist);
router.delete("/user/wishlist/:productId", authCheck, removeFromWishlist);

module.exports = router;
