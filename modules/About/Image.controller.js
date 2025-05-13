const fs = require('fs');
const path = require('path');
const About = require('./About.model'); // Updated import to About


exports.uploadImage = async (req, res) => {
  console.log("About Image Upload...............");

  try {
    const id = req.params.id || req.query.id || req.body.id;
    if (!id) {
      return res.status(400).json({ error: 'About ID is required' });
    }

    // Check if file is uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const file = req.files[0]; // Only one file expected
    const field = (file.fieldname || 'image').toLowerCase();
    const image = file.filename;

    const folderMap = {
      image: 'Image',
      avatar: 'Avatar',
      url: 'Url'
    };
    const folder = folderMap[field] || 'Other';

    const about = await About.findById(id);
    if (!about) {
      return res.status(404).json({ error: 'About entry not found' });
    }

    // Remove old image if it exists based on the field
    if (about[field]) {
      const oldImagePath = path.join(
        process.cwd(),
        'public',
        'images',
        'YuvaGurukul',
        'About',
        folder,
        about[field]
      );
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

    // Set the uploaded image filename to the appropriate field
    about[field] = image;

    // Save the changes to the database
    await about.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      data: about
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



// Upload About Image field add image upload
// exports.uploadImage = async (req, res) => {
//   console.log("About Image Upload...............");
//   try {
//     const id = req.params.id || req.query.id || req.body.id;
//     console.log(`About ID: ${id}`);

//     if (!id) {
//       return res.status(400).json({ error: 'About ID is required' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file uploaded' });
//     }

//     const image = req.file.filename;
//     // const field = req.query.field || req.body.field || 'image'; // Determine folder based on query param
//     const field = (req.query.field || 'image').toLowerCase();
//     const folderMap = {
//       image: 'Image',
//       avatar: 'Avatar',
//       url: 'Url'
//     };
//     const folder = folderMap[field] || 'Other';

//     const about = await About.findById(id);
//     if (!about) {
//       return res.status(404).json({ error: 'About entry not found' });
//     }

//     // Remove old image if it exists
//     if (about.image) {
//       const oldImagePath = path.join(
//         process.cwd(),
//         'public',
//         'images',
//         'YuvaGurukul',
//         'About',
//         folder,
//         about.image
//       );
//       console.log(`Old image path: ${oldImagePath}`);

//       try {
//         await fs.promises.access(oldImagePath);
//         await fs.promises.unlink(oldImagePath);
//         console.log('Old image deleted successfully');
//       } catch (err) {
//         if (err.code !== 'ENOENT') {
//           console.error(`Failed to delete old image: ${err.message}`);
//         }
//       }
//     }

//     // Save new image filename
//     about.image = image;
//     await about.save();

//     res.status(200).json({
//       message: 'Image uploaded successfully',
//       data: about
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };


// Upload About Image  Simple image upload 
// exports.uploadImage = async (req, res) => {
//   console.log("About Image Upload...............");

//   try {
//     const id = req.params.id || req.query.id || req.body.id;

//     if (!id) {
//       return res.status(400).json({ error: 'About ID is required' });
//     }

//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file uploaded' });
//     }

//     const image = req.file.filename;

//     const about = await About.findById(id);
//     console.log("about", about.image);
//     if (!about) {
//       return res.status(404).json({ error: 'About entry not found' });
//     }

//     // Remove old image if it exists
//     if (about.image) {
//       const oldImagePath = path.join(process.cwd(), 'public', 'images', 'YuvaGurukul', 'About', about.image);
//       console.log(`Old image path: ${oldImagePath}`);

//       try {
//         await fs.promises.access(oldImagePath);
//         await fs.promises.unlink(oldImagePath);
//         console.log('Old image deleted successfully');
//       } catch (err) {
//         if (err.code !== 'ENOENT') {
//           console.error(`Failed to delete old image: ${err.message}`);
//         }
//       }
//     }

//     // Update with new image filename
//     about.image = image;
//     await about.save();

//     res.status(200).json({ message: 'Image uploaded successfully', data: about });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: error.message });
//   }
// };

// Remove About Image by ID
// exports.RemoveImageById = async (id) => {
//   console.log('Removing image file for About...');

//   if (!id) throw new Error('About ID is required');

//   const about = await About.findById(id);
//   if (!about) throw new Error('About entry not found');

//   if (about.image) {
//     const imagePath = path.join(
//       process.cwd(),
//       'public',
//       'images',
//       'YuvaGurukul',
//       'About',
//       about.image
//     );

//     try {
//       await fs.promises.access(imagePath);
//       await fs.promises.unlink(imagePath);
//       console.log('Image file deleted successfully');
//     } catch (err) {
//       if (err.code !== 'ENOENT') {
//         throw new Error('Error deleting image from storage: ' + err.message);
//       } else {
//         console.warn('Image file not found on disk');
//       }
//     }
//   }
// };




exports.RemoveImageById = async (id) => {
  console.log('Removing image and avatar files for About...');

  if (!id) throw new Error('About ID is required');

  const about = await About.findById(id);
  if (!about) throw new Error('About entry not found');

  // Delete image if it exists
  if (about.image) {
    const imagePath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'About',
      'Image',
      about.image
    );

    try {
      await fs.promises.access(imagePath);
      await fs.promises.unlink(imagePath);
      console.log('Image file deleted successfully');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('Error deleting image: ' + err.message);
      } else {
        console.warn('Image file not found on disk');
      }
    }
  }

  // Delete avatar if it exists
  if (about.avatar) {
    const avatarPath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'About',
      'Avatar',
      about.avatar
    );

    try {
      await fs.promises.access(avatarPath);
      await fs.promises.unlink(avatarPath);
      console.log('Avatar file deleted successfully');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('Error deleting avatar: ' + err.message);
      } else {
        console.warn('Avatar file not found on disk');
      }
    }
  }
};