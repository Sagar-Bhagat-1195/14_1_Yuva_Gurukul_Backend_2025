const Footer = require('./Footer.model');  // No need for separate SocialLink model
const { RemoveImageById } = require('./Image.controller');

exports.createFooter = async (req, res) => {
    try {
        const {
            title,
            description,
            logo,
            address,
            phone,
            email,
            map,
            socialLinks, // array of objects directly
            isEnabled,
        } = req.body;

        // Validate required fields
        if (!title || !address || !phone || !email) {
            return res.status(400).json({
                isSuccess: false,
                message: 'Title, address, phone, and email are required.',
            });
        }

        // Check if the footer already exists
        // const existingFooter = await Footer.findOne({});
        // if (existingFooter) {
        //     return res.status(409).json({
        //         isSuccess: false,
        //         message: 'Footer already exists. You may want to update it instead.',
        //     });
        // }

        // Create new footer with the provided social links directly (no need to save separately)
        const newFooter = new Footer({
            title,
            description,
            logo,
            address,
            phone,
            email,
            map,
            socialLinks,  // Directly use the array from the request body
            isEnabled,
        });

        // Save the new footer
        const savedFooter = await newFooter.save();

        // Return success response
        res.status(201).json({
            isSuccess: true,
            message: 'Footer created successfully.',
            data: savedFooter,
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to create footer.',
            error: error.message,
        });
    }
};


// Update or add social links to an existing footer
exports.SocialLinksAdd = async (req, res) => {
    try {
        // Get the footer ID from params, query, or body
        const id = req.params.id || req.query.id || req.body.id;
        const { socialLinks } = req.body;  // Social links array from the request body

        // Validate required fields
        if (!id || !socialLinks || !Array.isArray(socialLinks)) {
            return res.status(400).json({
                isSuccess: false,
                message: 'ID and socialLinks are required, and socialLinks must be an array.',
            });
        }

        // Find the existing footer by footerId
        const footer = await Footer.findById(id);
        if (!footer) {
            return res.status(404).json({
                isSuccess: false,
                message: 'Footer not found.',
            });
        }

        // Update the socialLinks array in the existing footer
        footer.socialLinks = [...footer.socialLinks, ...socialLinks];

        // Save the updated footer
        const updatedFooter = await footer.save();

        // Return success response
        res.status(200).json({
            isSuccess: true,
            message: 'Social links updated successfully.',
            data: updatedFooter,
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to update social links.',
            error: error.message,
        });
    }
};


// Update an existing footer by ID
exports.updateFooter = async (req, res) => {
    try {
        // Get the footer ID from params, query, or body
        const footerId = req.params.id || req.query.id || req.body.id;
        const {
            title,
            description,
            logo,
            address,
            phone,
            email,
            map,
            socialLinks,  // Directly use the array from the request body
            isEnabled
        } = req.body;

        // Find the existing footer by ID
        const footer = await Footer.findById(footerId);
        if (!footer) {
            return res.status(404).json({
                isSuccess: false,
                message: 'Footer not found.',
            });
        }

        // Update the footer's fields
        footer.title = title || footer.title;
        footer.description = description || footer.description;
        footer.logo = logo || footer.logo;
        footer.address = address || footer.address;
        footer.phone = phone || footer.phone;
        footer.email = email || footer.email;
        footer.map = map || footer.map;
        footer.socialLinks = socialLinks || footer.socialLinks;
        footer.isEnabled = isEnabled !== undefined ? isEnabled : footer.isEnabled;

        // Save the updated footer
        const updatedFooter = await footer.save();

        // Return success response
        res.status(200).json({
            isSuccess: true,
            message: 'Footer updated successfully.',
            data: updatedFooter,
        });
    } catch (error) {
        // Handle any errors
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to update footer.',
            error: error.message,
        });
    }
};


exports.getAllFooterByIDAndTypeAll = async (req, res) => {
    try {
        // Get the footer ID from params, query, or body
        const id = req.params.id || req.query.id || req.body.id;

        let result;

        if (id) {
            // If ID is provided, fetch a single footer
            result = await Footer.findById(id);
            if (!result) {
                return res.status(404).json({
                    isSuccess: false,
                    message: 'Footer not found with the provided ID.',
                });
            }
        } else {
            // If no ID, fetch all footers
            result = await Footer.find();
            if (result.length === 0) {
                return res.status(404).json({
                    isSuccess: false,
                    message: 'No footers found.',
                });
            }
        }

        res.status(200).json({
            isSuccess: true,
            message: id ? 'Footer retrieved successfully.' : 'All footers retrieved successfully.',
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to retrieve footer(s).',
            error: error.message,
        });
    }
};


exports.deleteFooter = async (req, res) => {
    try {
        // Get the footer ID from params, query, or body
        const id = req.params.id || req.query.id || req.body.id;

        if (!id) {
            return res.status(400).json({
                isSuccess: false,
                message: 'Footer ID is required for deletion.',
            });
        }

        // Delete image from filesystem
        await RemoveImageById(id);

        const deletedFooter = await Footer.findByIdAndDelete(id);

        if (!deletedFooter) {
            return res.status(404).json({
                isSuccess: false,
                message: 'Footer not found.',
            });
        }

        res.status(200).json({
            isSuccess: true,
            message: 'Footer deleted successfully.',
            data: deletedFooter,
        });
    } catch (error) {
        res.status(500).json({
            isSuccess: false,
            message: 'Failed to delete footer.',
            error: error.message,
        });
    }
};
