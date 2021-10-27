const Enum = require("./index");

const rolesNames = ["guest", "subscriber", "admin"];

exports.Role = Enum(rolesNames);
