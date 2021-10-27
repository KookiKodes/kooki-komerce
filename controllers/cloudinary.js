const cloudinary = require("cloudinary").v2;
const { DateTime } = require("luxon");

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

// config"
cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

exports.upload = async (req, res) => {
  try {
    const { public_id, secure_url } = await cloudinary.uploader.upload(
      req.body.image,
      {
        public_id: `${DateTime.now().toISO()}`,
        resource_type: "auto", //jpeg, png
      }
    );
    res.json({ public_id, secure_url });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  const { public_id } = req.body;
  try {
    cloudinary.uploader.destroy(public_id, (err, _) => {
      if (err) return res.json({ success: false, message: err.message });
      res.json({ success: true, message: "Image deleted" });
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
};
