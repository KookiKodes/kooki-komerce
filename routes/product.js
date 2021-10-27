const { Router } = require("express");

const router = Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controllers
const {
  create,
  listAll,
  remove,
  read,
  update,
  list,
  total,
  readPopulated,
  addReview,
  listRelated,
  totalRelated,
  searchFilters,
} = require("../controllers/product");

// routes
router.post("/product", authCheck, adminCheck, create);
router.get("/products/total", total);
router.get("/products/:count", listAll);
router.get("/product/:slug", read);
router.get("/product/:slug/populate", readPopulated);
router.delete("/product/:slug", authCheck, adminCheck, remove);
router.put("/product/:slug", authCheck, adminCheck, update);
router.post("/products", list);

// rating
router.put("/product/rating/:productId", authCheck, addReview);

// related
router.get(
  "/product/related/:productId/:page/:limit/:sort/:order",
  listRelated
);
router.get("/product/related/:productId/total", totalRelated);

// search
router.post("/search/filters", searchFilters);

module.exports = router;
