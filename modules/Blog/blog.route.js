const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
const UserSecure = require("../user/user.secure")

const imageRoutes = require("./Image.route"); // Adjust the path as necessary


//imageSlider
// Use image routes Only imge update and add image
router.use("/", UserSecure, imageRoutes);

router.post('/', UserSecure, blogController.createBlog);
router.get('/:id?', UserSecure, blogController.getBlogsById_Slug_All);
router.put('/:id', UserSecure, blogController.updateBlog);
router.delete('/:id', UserSecure, blogController.deleteBlog);

module.exports = router;
