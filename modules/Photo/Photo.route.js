const express = require('express');
const router = express.Router();
const photoController = require('./Photo.controller');
const UserSecure = require("../user/user.secure");
const imageRoutes = require("./Image.route"); // Adjust the path as necessary


//imageSlider
// Use image routes Only imge update and add image
router.use("/", UserSecure, imageRoutes);

// Create a new photo
router.post('/',UserSecure, photoController.addPhoto);

// Get all photos or a single photo by ID or type
router.get('/:id?',UserSecure, photoController.getAllPhotosByIDAndTypeAll);

// Update photo by ID
router.put('/:id',UserSecure, photoController.updatePhoto);

// Delete photo by ID
router.delete('/:id',UserSecure, photoController.deletePhoto);

module.exports = router;
