const Product = require("../models/product");
const User = require("../models/user");
const slugify = require("slugify");
const { ObjectId } = require("mongoose").Types;

exports.create = async (req, res) => {
  try {
    console.log(req.body);
    req.body.slug = slugify(req.body.title);
    const newProduct = await new Product(req.body).save();
    res.json(newProduct);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.read = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug }).populate("category").exec();
    res.json(product);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.readPopulated = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug })
      .populate("category")
      .populate("subs")
      .exec();
    res.json(product);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  const { slug } = req.params;
  try {
    if (req.body.title) req.body.slug = slugify(req.body.title);
    const updatedProduct = await Product.findOneAndUpdate({ slug }, req.body, {
      new: true,
    }).exec();
    res.json(updatedProduct);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.listAll = async (req, res) => {
  const { count } = req.params;
  try {
    const products = await Product.find({})
      .limit(parseInt(count))
      .populate("category")
      .populate("subs")
      .sort([["createAt", "desc"]])
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.total = async (req, res) => {
  try {
    const total = await Product.find({}).estimatedDocumentCount().exec();
    res.json(total);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

// exports.list = async (req, res) => {
//   try {
//     // sort will be "createdAt"
//     // order will be "dsc" or "asc"
//     // limit will be a number
//     const { sort, order, limit } = req.body;

//     const products = await Product.find({})
//       .populate("category")
//       .populate("subs")
//       .sort([[sort, order]])
//       .limit(limit)
//       .exec();
//     res.json(products);
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({ message: err.message });
//   }
// };

exports.list = async (req, res) => {
  try {
    // sort will be "createdAt"
    // order will be "dsc" or "asc"
    // page will be a number
    const {
      sort = "createdAt",
      order = "desc",
      limit = 3,
      page = 1,
    } = req.body;

    const products = await Product.find({})
      .skip((page - 1) * limit)
      .populate("category")
      .populate("subs")
      .sort([[sort, order]])
      .limit(limit)
      .exec();
    res.json(products);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOneAndRemove({ slug }).exec();
    res.json(product);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ message: err.message });
  }
};

exports.addReview = async (req, res) => {
  const { productId } = req.params;
  const { star } = req.body;
  const {
    user: { email },
  } = req;
  try {
    const product = await Product.findById(productId).exec();
    const user = await User.findOne({ email }).exec();

    // who is updating
    // check if currently logged in user has already added a rating
    const existingRating = product.ratings.find(
      ({ postedBy }) => postedBy.toString() === user._id.toString()
    );
    if (existingRating) {
      const updatedRating = await Product.updateOne(
        { ratings: { $elemMatch: existingRating } },
        { $set: { "ratings.$.star": star } },
        { new: true }
      );
      console.log("Rating Updated", updatedRating);
      res.json(updatedRating);
    } else {
      // if no existing rating by user
      const addedRating = await Product.findByIdAndUpdate(
        product._id,
        {
          $push: { ratings: { star, postedBy: user._id } },
        },
        { new: true }
      );
      console.log("Rating Added", addedRating);
      res.json(addedRating);
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.listRelated = async (req, res) => {
  const { productId, page, limit, sort, order } = req.params;

  try {
    const product = await Product.findById(productId).exec();
    const related = await Product.find({
      _id: { $ne: productId },
      category: product.category,
    })
      .skip((page - 1) * limit)
      .sort([[sort, order]])
      .limit(limit)
      .populate("category")
      .populate("subs")
      .exec();
    res.json(related);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
};

exports.totalRelated = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId).exec();
    const related = await Product.find({
      _id: { $ne: productId },
      category: product.category,
    }).exec();
    res.json(related?.length);
  } catch (err) {
    console.log(err.message);
    res.json(err.message);
  }
};

const handlePrice = (req) => {
  const { price } = req.body;
  if (price && price.length) {
    console.log("price", price);
    return [
      {
        $match: {
          price: {
            $gte: price[0],
            $lte: price[1],
          },
        },
      },
    ];
  }
  return [];
};

const handleCategory = (req) => {
  const { category } = req.body;
  if (category && category.length) {
    console.log("category", category);
    const categories = category.map((id) => ObjectId(id));
    return [
      {
        $match: {
          category: {
            $in: categories,
          },
        },
      },
    ];
  }
  return [];
};

const handleSubs = (req) => {
  const { subs } = req.body;
  if (subs && subs.length) {
    const subss = subs.map((id) => ObjectId(id));
    console.log("subs", subs);
    return [
      {
        $match: {
          subs: {
            $in: subss,
          },
        },
      },
    ];
  }
  return [];
};

const handleQuery = (req) => {
  const { query } = req.body;
  if (query) {
    console.log("query", query);
    return [
      {
        $match: {
          $or: [
            {
              title: { $regex: query, $options: "i" },
            },
            { description: { $regex: query, $options: "i" } },
          ],
        },
      },
    ];
  }
  return [];
};

const handleStars = (req) => {
  const { stars } = req.body;
  if (stars && stars.length) {
    console.log("stars", stars);
    return [
      {
        $project: {
          averageRating: { $avg: "$ratings.star" },
          _id: "$_id",
          title: "$title",
          slug: "$slug",
          description: "$description",
          price: "$price",
          quantity: "$quantity",
          sold: "$sold",
          images: "$images",
          shipping: "$shipping",
          color: "$color",
          brand: "$brand",
          createdAt: "$createdAt",
          updatedAt: "$updatedAt",
          ratings: "$ratings",
        },
      },
      {
        $match: {
          averageRating: { $gte: stars[0], $lt: stars[1] },
        },
      },
    ];
  }
  return [];
};

const handleBrand = (req) => {
  const { brand } = req.body;
  if (brand && brand.length) {
    console.log("brand", brand);
    return [
      {
        $match: {
          brand: {
            $in: brand,
          },
        },
      },
    ];
  }
  return [];
};

const handleColor = (req) => {
  const { color } = req.body;
  if (color && color.length) {
    console.log("color", color);
    return [
      {
        $match: {
          color: {
            $in: color,
          },
        },
      },
    ];
  }
  return [];
};

const handleShipping = (req) => {
  const { shipping } = req.body;
  if (shipping) {
    console.log("shipping", shipping);
    return [
      {
        $match: {
          shipping,
        },
      },
    ];
  }
  return [];
};

exports.searchFilters = async (req, res) => {
  // will add this to add pagination
  // const { limit, page } = req.body;
  const allQueries = [
    ...handleCategory(req),
    ...handleSubs(req),
    ...handleQuery(req),
    ...handlePrice(req),
    ...handleBrand(req),
    ...handleColor(req),
    ...handleShipping(req),
    ...handleStars(req),
  ];

  try {
    const products = await Product.aggregate(allQueries).exec();
    res.json(products);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};
