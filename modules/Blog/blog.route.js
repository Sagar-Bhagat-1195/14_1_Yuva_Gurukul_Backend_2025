const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
const UserSecure = require("../user/user.secure")

router.post('/', UserSecure, blogController.createBlog);
router.get('/:id?', UserSecure, blogController.getBlogsById_Slug_All);
router.put('/:id', UserSecure, blogController.updateBlog);
router.delete('/:id', UserSecure, blogController.deleteBlog);

module.exports = router;
