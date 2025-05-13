const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const imageController = require("./Image.controller"); // Adjust path as needed

// Dynamic multer middleware field add image upload
// const dynamicMulter = () => {
//   const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       // const field = req.query.field || req.body.field || 'image';
//       const field = (req.query.field || 'image').toLowerCase();
//       console.log(req.query);
//       console.log(req.body);
//       console.log(req.params);
//       console.log(file.fieldname);
      
//       const destMap = {
//         image: './public/images/YuvaGurukul/About/Image/',
//         avatar: './public/images/YuvaGurukul/About/Avatar/',
//         url: './public/images/YuvaGurukul/About/Url/'
//       };
//       const dest = destMap[field] || './public/images/YuvaGurukul/About/Other/';
//       cb(null, dest);
//     },
//     filename: function (req, file, cb) {
//       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//       cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//     }
//   });

//   const upload = multer({ storage });

//   return (req, res, next) => {
//     const fieldName = req.query.field || 'image';
//     upload.single(fieldName)(req, res, function (err) {
//       if (err instanceof multer.MulterError) {
//         return res.status(400).json({ error: err.message });
//       } else if (err) {
//         return res.status(500).json({ error: err.message });
//       }
//       next();
//     });
//   };
// };

// Dynamic multer middleware
const dynamicMulter = () => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const field = (file.fieldname || 'image').toLowerCase();

      const destMap = {
        image: './public/images/YuvaGurukul/About/Image/',
        avatar: './public/images/YuvaGurukul/About/Avatar/',
        url: './public/images/YuvaGurukul/About/Url/',
      };
      const dest = destMap[field] || './public/images/YuvaGurukul/About/Other/';
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  return (req, res, next) => {
    upload.any()(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: err.message });
      } else if (err) {
        return res.status(500).json({ error: err.message });
      }

      // You can now access: req.files[0] or filter by fieldname if multiple
      next();
    });
  };
};



// Route with dynamic multer
router.put("/image/:id?", dynamicMulter(), imageController.uploadImage);

module.exports = router;
