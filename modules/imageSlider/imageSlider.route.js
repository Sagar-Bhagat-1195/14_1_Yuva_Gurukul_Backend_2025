const express = require("express");
const router = express.Router();
const imageController = require("./imageSlider.controller");
const UserSecure = require("../user/user.secure");
const imageRoutes = require("./Image.route"); // Adjust the path as necessary


//imageSlider
// Use image routes Only imge update and add image
router.use("/", UserSecure, imageRoutes);

// CREATE //imageSlider
router.post("/", UserSecure, imageController.createImageSlider);

// READ ONE //All images
router.get("/:id?", UserSecure, imageController.getImageSliderById);

// UPDATE
router.put("/:id", UserSecure, imageController.updateImageSliderById);

// DELETE
router.delete("/:id", UserSecure, imageController.deleteImageSliderById);



module.exports = router;
