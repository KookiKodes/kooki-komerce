const { Router } = require("express");

const router = Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controllers
const { create, remove, list } = require("../controllers/coupon.js");

// routes
router.post("/coupon", authCheck, adminCheck, create);
router.get("/coupons", list);
router.delete("/coupon/:id", authCheck, adminCheck, remove);

module.exports = router;
