const fs = require('fs');
const path = require('path');
const Footer = require('./Footer.model'); // Changed from Photo to Footer

// Upload Footer Image
exports.uploadImage = async (req, res) => {
  console.log("Footer Image Upload...............");

  try {
    const id = req.params.id || req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ error: 'Footer ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const image = req.file.filename;

    const footer = await Footer.findById(id);
    console.log("footer", footer.image);

    if (!footer) {
      return res.status(404).json({ error: 'Footer not found' });
    }

    // Remove old image if it exists
    if (footer.image) {
      const oldImagePath = path.join(process.cwd(), 'public', 'images', 'YuvaGurukul', 'Footer', footer.image);
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
    footer.image = image;
    await footer.save();

    res.status(200).json({ message: 'Image uploaded successfully', data: footer });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Remove Footer Image by ID
exports.RemoveImageById = async (id) => {
  console.log('Removing image file for Footer...');

  if (!id) throw new Error('Footer ID is required');

  const footer = await Footer.findById(id);
  if (!footer) throw new Error('Footer not found');

  if (footer.image) {
    const imagePath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'Footer',
      footer.image
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
