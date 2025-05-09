const fs = require('fs');
const path = require('path');
const Photo = require('./Photo.model'); // Changed import to Photo

// Upload Photo Image
exports.uploadImage = async (req, res) => {
  console.log("Photo Image Upload...............");

  try {
    const id = req.params.id || req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ error: 'Photo ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const image = req.file.filename;

    const photo = await Photo.findById(id);
    console.log("photo", photo.image);
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Remove old image if it exists
    if (photo.image) {
      const oldImagePath = path.join(process.cwd(), 'public', 'images', 'YuvaGurukul', 'Photo', photo.image);
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
    photo.image = image;
    await photo.save();

    res.status(200).json({ message: 'Image uploaded successfully', data: photo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// Remove Photo Image by ID
exports.RemoveImageById = async (id) => {
  console.log('Removing image file for Photo...');

  if (!id) throw new Error('Photo ID is required');

  const photo = await Photo.findById(id);
  if (!photo) throw new Error('Photo not found');

  if (photo.image) {
    const imagePath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'Photo',
      photo.image
    );

    try {
      await fs.promises.access(imagePath);
      await fs.promises.unlink(imagePath);
      console.log('Image file deleted successfully');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('Error deleting image from storage: ' + err.message);
      } else {
        console.warn('Image file not found on disk');
      }
    }
  }
};
