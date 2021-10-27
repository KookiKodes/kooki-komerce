const Sub = require("../models/sub");
const Product = require("../models/product");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name, parent } = req.body;
    console.log(req.body);
    const sub = await new Sub({ name, slug: slugify(name), parent }).save();
    res.json(sub);
  } catch (err) {
    console.log(err.message);
    res.status(400).send("Create sub failed");
  }
};

exports.list = async (req, res) => {
  try {
    const subs = await Sub.find({}).sort({ updatedAt: -1 }).exec();
    res.json(subs);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.listByParent = async (req, res) => {
  const { slug } = req.params;
  try {
    const subs = await Sub.find({ parent: slug })
      .sort({ updatedAt: -1 })
      .exec();
    res.json(subs);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.read = async (req, res) => {
  try {
    const { slug } = req.params;
    const sub = await Sub.findOne({ slug }).exec();
    res.json(sub);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.readWithProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const sub = await Sub.findOne({ slug }).exec();
    const products = await Product.find({ subs: sub })
      .populate("category")
      .exec();
    res.json({ sub, products });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body,
      { slug } = req.params;
    const updated = await Sub.findOneAndUpdate(
      { slug },
      {
        name,
        slug: slugify(name),
      },
      { new: true }
    ).exec();
    res.json(updated);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { slug } = req.params;
    const deleted = await Sub.findOneAndDelete({ slug }).exec();
    if (deleted) return res.json(deleted);
    return res.status(400).json({ message: "Sub-category does not exist" });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};
