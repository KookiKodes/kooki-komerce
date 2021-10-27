const User = require("../models/user");
const { Role } = require("../enums/Role");

exports.createOrUpdateUser = async (req, res) => {
  const { name, picture, email } = req.user;

  const user = await User.findOneAndUpdate(
    { email },
    { name: email.replace(/@\S+$/gi, ""), picture },
    { new: true }
  );

  if (user) {
    console.log("USER UPDATED", user);
    return res.json(user);
  }

  const newUser = await new User({
    email,
    name: email.replace(/@\S+$/gi, ""),
    picture,
    role: Role.subscriber,
  }).save();

  console.log("USER CREATED", newUser);
  return res.json(newUser);
};

exports.currentUser = async (req, res) => {
  const { name, picture, email } = req.user;
  User.findOne({ email }).exec((err, user) => {
    if (err) return res.status(400).json({ message: err.message });
    res.json(user);
  });
};
