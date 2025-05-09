const express = require('express');
const router = express.Router();
const footerController = require('./Footer.controller');
const UserSecure = require("../user/user.secure");

const imageRoutes = require("./Image.route"); // Adjust the path as necessary


//imageSlider
// Use image routes Only imge update and add image
router.use("/", UserSecure, imageRoutes);

// Create footer
router.post('/',UserSecure, footerController.createFooter);

router.put('/SocialLinks/:id',UserSecure, footerController.SocialLinksAdd);

// Get all footers
router.get('/:id?', footerController.getAllFooterByIDAndTypeAll); 

// Update footer by ID
router.put('/:id', footerController.updateFooter);

// Delete footer by ID
router.delete('/:id', footerController.deleteFooter);

module.exports = router;
