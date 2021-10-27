const admin = require("../firebase");
const User = require("../models/user");
const { Role } = require("../enums/Role");

exports.authCheck = async (req, res, next) => {
  // token
  try {
    const firebaseUser = await admin
      .auth()
      .verifyIdToken(req.headers.authtoken);
    console.log("FIREBASE USER IN AUTHCHECK");
    req.user = firebaseUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};

exports.adminCheck = async (req, res, next) => {
  const { email } = req.user;

  const adminUser = await User.findOne({ email }).exec();

  if (adminUser.role !== Role.ADMIN) {
    res.status(403).json({
      error: "Admin resource. Access denied.",
    });
  } else {
    next();
  }
};
