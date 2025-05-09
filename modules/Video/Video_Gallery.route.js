const express = require('express');
const router = express.Router();
const videoController = require('./Video_Gallery.controller');

router.post('/', videoController.addVideo);
router.get('/:id?', videoController.getAllVideosByIDAndTypeAll);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);


module.exports = router;
