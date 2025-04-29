const fs = require('fs');
const path = require('path');
const ImageSlider = require('./imageSlider.model'); // Changed import to ImageSlider

// Upload ImageSlider Image
exports.uploadImage = async (req, res) => {
  console.log("ImageSlider Image Upload...............");

  try {
    const id = req.params.id || req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ error: 'ImageSlider ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const image = req.file.filename;

    const slider = await ImageSlider.findById(id);
    console.log("slider", slider.image);
    if (!slider) {
      return res.status(404).json({ error: 'ImageSlider not found' });
    }

    // Remove old image if it exists
    if (slider.image) {
      const oldImagePath = path.join(process.cwd(), 'public', 'images','YuvaGurukul', 'ImageSlider', slider.image);
      console.log(`Old image path: ${oldImagePath}`);

      try {
        await fs.promises.access(oldImagePath);
        await fs.promises.unlink(oldImagePath);
        console.log('Old image deleted successfully');
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Failed to delete old image: ${err.message}`);
        }
      }
    }

    // Update with new image filename
    slider.image = image;
    await slider.save();

    res.status(200).json({ message: 'Image uploaded successfully', data: slider });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
