const { Router } = require("express");

const router = Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

const { upload, remove } = require("../controllers/cloudinary");

// routes
router.post("/upload-image", authCheck, adminCheck, upload);
router.post("/remove-image", authCheck, adminCheck, remove);

module.exports = router;
