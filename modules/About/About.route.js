const express = require("express");
const router = express.Router();
const aboutController = require("./About.controller");
const UserSecure = require("../user/user.secure")
// const imageRoutes = require("./Image.route"); // Import image routes

// Use image routes
// router.use("/", imageRoutes);

// Routes for handling abouts
router.post("/", UserSecure,aboutController.createAbout);
router.get("/:id?",UserSecure, aboutController.getAboutByIdOrAll);
router.put("/:id",UserSecure, aboutController.updateAbout);
router.delete("/:id",UserSecure, aboutController.deleteAbout);



module.exports = router;
