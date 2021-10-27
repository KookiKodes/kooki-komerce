const admin = require("firebase-admin");
const { join } = require("path");

const serviceAccount = require(join(
  __dirname,
  "..",
  "config",
  "fbServiceAccountKey.json"
));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
