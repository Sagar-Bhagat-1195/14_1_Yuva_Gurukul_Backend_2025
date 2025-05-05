const ImageSlider = require("./imageSlider.model");
const {RemoveImageById} = require ("./Image.controller"); // Adjust the path as necessary


// CREATE - With automatic order assignment
exports.createImageSlider = async (req, res) => {
    try {
        const { title, subtitle, image, link, order = 0, isActive = true } = req.body;

        const newImage = new ImageSlider({
            title,
            subtitle,
            image,
            link,
            order, // Will be auto-corrected if 0
            isActive
        });

        await newImage.save();
        res.status(201).json({
            isSuccess: true,
            message: "Image created successfully",
            data: newImage
        });
    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            message: error.name === 'ValidationError'
                ? Object.values(error.errors).map(e => e.message).join(', ')
                : 'Failed to create image',
            error: error.message
        });
    }
};

// READ - Get all (ordered) or single image
exports.getImageSliderById = async (req, res) => {
    try {
        // const { id } = req.params;

        // Check if id is passed in params, query, or body
        const id = req.params.id || req.query.id || req.body.id;
        console.log(`[DEBUG] Attempting to process ID: ${id}`);


        if (id) {
            const image = await ImageSlider.findById(id);
            if (!image) {
                return res.status(404).json({
                    isSuccess: false,
                    message: "Image not found"
                });
            }
            return res.status(200).json({
                isSuccess: true,
                data: image
            });
        }

        const images = await ImageSlider.find().sort({ order: 1 });
        res.status(200).json({
            isSuccess: true,
            count: images.length,
            data: images
        });
    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            message: "Failed to fetch images",
            error: error.message
        });
    }
};

// UPDATE - With order management
exports.updateImageSliderById = async (req, res) => {
    try {
        // const { id } = req.params;
        const id = req.params.id || req.query.id || req.body.id;
        const updateData = req.body;

        // Prevent order tampering
        if ('order' in updateData) {
            const currentItem = await ImageSlider.findById(id);
            if (currentItem.order !== updateData.order) {
                await ImageSlider.updateMany(
                    { order: { $gte: updateData.order } },
                    { $inc: { order: 1 } }
                );
            }
        }

        const updatedImage = await ImageSlider.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        const Allimages = await ImageSlider.find().sort({ order: 1 });

        if (!updatedImage) {
            return res.status(404).json({
                isSuccess: false,
                message: "Image not found"
            });
        }

        res.status(200).json({
            isSuccess: true,
            message: "Image updated successfully",
            data: updatedImage,
            Allimages: Allimages
        });
    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            message: error.name === 'ValidationError'
                ? Object.values(error.errors).map(e => e.message).join(', ')
                : 'Failed to update image',
            error: error.message
        });
    }
};

// DELETE - With automatic reordering
exports.deleteImageSliderById = async (req, res) => {
    try {
        const id = req.params.id || req.query.id || req.body.id;

        if (!id) {
            return res.status(400).json({
                isSuccess: false,
                message: 'ImageSlider ID is required',
            });
        }

        // Delete image from filesystem
        await RemoveImageById(id);

        // Delete record from DB
        const deletedImage = await ImageSlider.findByIdAndDelete(id);

        if (!deletedImage) {
            return res.status(404).json({
                isSuccess: false,
                message: 'Image not found',
            });
        }
        const Allimages = await ImageSlider.find().sort({ order: 1 });

        res.status(200).json({
            isSuccess: true,
            message: 'Image and record deleted successfully',
            data: deletedImage,
            Allimages: Allimages
        });
    } catch (error) {
        console.error('Error deleting image slider:', error);
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to delete image',
            error: error.message,
        });
    }
};
