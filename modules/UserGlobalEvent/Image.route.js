const express = require("express");
const router = express.Router();
const multer = require("multer");
const imageController = require("./Image.controller");

// Configure multer for image storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/YuvaGurukul/GlobalEvent');
  },
  filename: function (req, file, cb) {
    console.log(file);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + file.originalname);
    
  }
});

const upload = multer({ storage: storage });

router.put("/image/:id?", upload.single('image'), imageController.uploadImage);

module.exports = router;
