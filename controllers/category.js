const Category = require("../models/category");
const Product = require("../models/product");
const Sub = require("../models/sub");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ updatedAt: -1 }).exec();
    res.json(categories);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.read = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).exec();
    res.json(category);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.readWithProducts = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).exec();
    const products = await Product.find({ category: category })
      .populate("subs")
      .exec();
    res.json({ category, products });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name } = req.body,
      { slug } = req.params;
    const updated = await Category.findOneAndUpdate(
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
    const deleted = await Category.findOneAndDelete({ slug }).exec();
    await Sub.deleteMany({ parent: deleted._id }).exec();
    if (deleted) return res.json(deleted);
    return res.status(400).json({ message: "Category does not exist" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
