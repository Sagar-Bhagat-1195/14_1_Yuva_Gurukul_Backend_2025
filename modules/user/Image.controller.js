const fs = require('fs');
const path = require('path');
const User = require('./user.model'); // Adjust the import according to your project structure

// Upload Image for Project
// exports.uploadImage = async (req, res) => {
//   try {
//     console.log("Project Image Upload...");
//     console.log(req.file); // Debugging statement

//     const { id } = req.params;
//     const img_url = req.file ? req.file.filename : null;

//     if (!img_url) {
//       return res.status(400).json({ error: 'No image file uploaded' });
//     }

//     const project = await Projects.findById(id);

//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     // Remove old image from local storage
//     if (project.img_url) {
//       const oldImagePath = path.join(process.cwd(), 'public', 'images', 'Devsky', 'Project', project.img_url);
//       console.log(`Old image path: ${oldImagePath}`); // Debugging statement
//       fs.unlink(oldImagePath, (err) => {
//         if (err) {
//           console.error(`Failed to delete old image: ${err.message}`); // Debugging statement
//         } else {
//           console.log('Old image deleted successfully');
//         }
//       });
//     }

//     // Update the Project document with the new image URL
//     project.img_url = img_url;
//     await project.save();

//     res.status(200).json({ message: 'Image uploaded successfully', project });
//   } catch (error) {
//     console.error(error); // Debugging statement
//     res.status(500).json({ error: error.message });
//   }
// };


// Upload User Avatar
exports.uploadAvatar = async (req, res) => {
  console.log("User Avatar Upload");

  try {
    // Extract user ID from request
    const id = req.params.id || req.query.id || req.body.id;
    const userId = req.UserSecure_id || id;

    console.log("User ID:", userId);

    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No avatar file uploaded' });
    }

    const avatar = req.file.filename;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove old avatar if it exists
    if (user.avatar) {
      const oldAvatarPath = path.join(process.cwd(), 'public', 'images', 'YuvaGurukul', 'User', user.avatar);
      console.log(`Old avatar path: ${oldAvatarPath}`);

      try {
        await fs.promises.access(oldAvatarPath); // Check if file exists
        await fs.promises.unlink(oldAvatarPath);
        console.log('Old avatar deleted successfully');
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error(`Failed to delete old avatar: ${err.message}`);
        }
      }
    }

    // Update user with new avatar
    user.avatar = avatar;
    await user.save();

    res.status(200).json({ message: 'Avatar uploaded successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// Upload Photo Gallery for Project
// exports.uploadPhotoGallery = async (req, res) => {
//   console.log("--------------------------------------------------------------");
//   try {
//     const { id } = req.params;
//     console.log(id);
//     const newPhotos = req.files ? req.files.map(file => file.filename) : [];

//     const project = await Projects.findById(id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     // Combine the existing photo gallery with the new photos
//     let updatedPhotoGallery = project.photo_gallery.concat(newPhotos);

//     // Define the maximum number of images allowed
//     const maxPhotos = 5;

//     // If the updated gallery exceeds the limit, remove the oldest images
//     if (updatedPhotoGallery.length > maxPhotos) {
//       const photosToRemove = updatedPhotoGallery.length - maxPhotos;
//       const photosToDelete = updatedPhotoGallery.slice(0, photosToRemove);

//       // Delete the oldest photos from local storage
//       photosToDelete.forEach(photo => {
//         const oldPhotoPath = path.join(process.cwd(), 'public', 'images', 'Devsky', 'Project', photo);
//         console.log(`Old photo path: ${oldPhotoPath}`); // Debugging statement
//         fs.unlink(oldPhotoPath, (err) => {
//           if (err) {
//             console.error(`Failed to delete old photo: ${err.message}`); // Debugging statement
//           } else {
//             console.log('Old photo deleted successfully');
//           }
//         });
//       });

//       // Remove the oldest photos from the gallery
//       updatedPhotoGallery = updatedPhotoGallery.slice(photosToRemove);
//     }

//     // Update the Project document with the new photo gallery
//     project.photo_gallery = updatedPhotoGallery;
//     await project.save();

//     res.status(200).json({ message: 'Photo gallery updated successfully', project });
//   } catch (error) {
//     console.error(error); // Debugging statement
//     res.status(500).json({ error: error.message });
//   }
// };



// Remove User Avatar by ID
exports.RemoveUserAvatarById = async (id) => {
  console.log('Removing avatar image for User...');

  if (!id) throw new Error('User ID is required');

  const user = await User.findById(id);
  if (!user) throw new Error('User not found');

  if (user.avatar) {
    const avatarPath = path.join(
      process.cwd(),
      'public',
      'images',
      'YuvaGurukul',
      'User', // update this to your actual avatar folder
      user.avatar
    );

    try {
      await fs.promises.access(avatarPath);
      await fs.promises.unlink(avatarPath);
      console.log('Avatar image deleted successfully');
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw new Error('Error deleting avatar from storage: ' + err.message);
      } else {
        console.warn('Avatar image file not found on disk');
      }
    }
  }
};

