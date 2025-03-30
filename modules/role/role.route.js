const express = require("express");
const router = express.Router();
const roleController = require("./role.controller");
const UserSecure = require("../user/user.secure");

// Add Role
router.put("/:position?/:superAdmin?/:admin?/:user?/:client?/:general?", UserSecure, roleController.AddRole);

// Get Roles
router.get("/:position?/:superAdmin?/:admin?/:user?/:client?/:general?", UserSecure, roleController.GetRole);

module.exports = router;
