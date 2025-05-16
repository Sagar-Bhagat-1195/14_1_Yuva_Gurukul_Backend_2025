const fs = require('fs');
const path = require('path');
const UserGlobalEvent = require('./UserGlobalEvent.model'); // Adjust the import according to your project structure


// Upload Event Image
exports.uploadImage = async (req, res) => {
  console.log("Global Event Image Upload...............");
  try {
    // Get event ID from request
    const id = req.params.id || req.query.id || req.body.id;

    // const userId = req.UserSecure_id || id;
    // console.log("User ID:", userId);

    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const image = req.file.filename;

    // Find the event
    const event = await UserGlobalEvent.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Global event not found' });
    }

    // Remove old image if it exists
    if (event.image) {
      const oldImagePath = path.join(process.cwd(), 'public', 'images', 'YuvaGurukul', 'GlobalEvent', event.image);
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

    // Update event with new image
    event.image = image;
    await event.save();

    res.status(200).json({ message: 'Image uploaded successfully', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



// Remove UserGlobalEvent image by ID
exports.RemoveUserGlobalEventImageById = async (id) => {
  console.log('Removing image for UserGlobalEvent...');

  if (!id) throw new Error('UserGlobalEvent ID is required');

  const event = await UserGlobalEvent.findById(id);
  if (!event) throw new Error('UserGlobalEvent not found');
  
  if (event.image) {
    const imagePath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'GlobalEvent', // Make sure this matches your folder structure
      event.image
    );

    try {
      await fs.promises.access(imagePath);
      await fs.promises.unlink(imagePath);
      console.log('UserGlobalEvent image deleted successfully');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('Error deleting image from storage: ' + err.message);
      } else {
        console.warn('Image file not found on disk');
      }
    }
  }
};

