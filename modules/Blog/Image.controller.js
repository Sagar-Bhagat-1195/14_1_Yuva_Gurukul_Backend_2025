const fs = require("fs");
const path = require("path");
const Blog = require("./blog.model"); // Changed from ImageSlider to Blog

// Upload Blog Image
exports.uploadImage = async (req, res) => {
  console.log("Blog Image Upload...............");

  try {
    const id = req.params.id || req.query.id || req.body.id;

    if (!id) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    const image = req.file.filename;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Remove old image if it exists
    if (blog.image) {
      const oldImagePath = path.join(
        process.cwd(),
        "public",
        "images",
        "YuvaGurukul",
        "Blog",
        blog.image
      );
      console.log(`Old image path: ${oldImagePath}`);

      try {
        await fs.promises.access(oldImagePath);
        await fs.promises.unlink(oldImagePath);
        console.log("Old image deleted successfully");
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error(`Failed to delete old image: ${err.message}`);
        }
      }
    }

    // Update with new image filename
    blog.image = image;
    await blog.save();

    res
      .status(200)
      .json({ message: "Image uploaded successfully", data: blog });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Remove Blog Image by ID
exports.RemoveImageById = async (id) => {
  console.log("Removing image file for Blog...");

  if (!id) throw new Error("Blog ID is required");

  const blog = await Blog.findById(id);
  if (!blog) throw new Error("Blog not found");

  if (blog.image) {
    const imagePath = path.join(
      process.cwd(),
      "public",
      "images",
      "YuvaGurukul",
      "Blog",
      blog.image
    );

    try {
      await fs.promises.access(imagePath);
      await fs.promises.unlink(imagePath);
      console.log("Image file deleted successfully");
    } catch (err) {
      if (err.code !== "ENOENT") {
        throw new Error("Error deleting image from storage: " + err.message);
      } else {
        console.warn("Image file not found on disk");
      }
    }
  }
};
