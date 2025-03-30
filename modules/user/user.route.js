var express = require("express");
var router = express.Router();
const userController = require("./user.controller");
const imageRoutes = require("./Image.route"); // Import image routes

const UserSecure = require("./user.secure");
// const super_UserSecure = require("../superadmin/superadmin.secure");

/* Routes */

// User signup and login
router.post("/signupp", userController.SignUpp); // With Password::
router.post("/SignUp", userController.SignUp);// With-Out Password::
router.post("/SignIn", userController.SignIn);// With-Out Password::  


router.post("/login", userController.Login);

// User update and delete routes
router.put("/update", UserSecure, userController.Update);
router.delete("/delete", UserSecure, userController.delete);

// User protect routes
router.get("/get/:data?", UserSecure, userController.GetUser);


// Use image routes
router.use("/", UserSecure, imageRoutes);


module.exports = router;
