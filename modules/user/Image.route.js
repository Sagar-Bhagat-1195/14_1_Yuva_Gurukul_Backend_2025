const express = require("express");
const router = express.Router();
const multer = require("multer");
const imageController = require("./Image.controller");

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/YuvaGurukul/User');
  },
  filename: function (req, file, cb) {
    console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    
  }
});

const upload = multer({ storage: storage });



// Route for uploading a single image
// router.post("/upload-image/:id", imageController.uploadImage);
// router.post("/upload-image/:id", upload.single('img_url'), imageController.uploadImage); // use
// router.post("/image", UserSecure, upload.single("image"), userController.UserImage);

// Route for uploading multiple images to the gallery
// router.post("/upload-gallery/:id", upload.array('photo_gallery', 10), imageController.uploadPhotoGallery);//use
// router.post("/upload-gallery/:id", upload.single('photo_gallery'), imageController.uploadPhotoGallery);

// Route for uploading avatar image
router.put("/avatar/:id?", upload.single('avatar'), imageController.uploadAvatar);

module.exports = router;
