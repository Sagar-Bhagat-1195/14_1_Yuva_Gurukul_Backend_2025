const express = require('express');
const router = express.Router();
const videoController = require('./Video_Gallery.controller');
const UserSecure = require("../user/user.secure");

router.post('/',UserSecure, videoController.addVideo);
router.get('/:id?',UserSecure,videoController.getAllVideosByIDAndTypeAll);
router.put('/:id', UserSecure,videoController.updateVideo);
router.delete('/:id', UserSecure,videoController.deleteVideo);


module.exports = router;
