const { body, validationResult } = require('express-validator');
const Photo = require('./Photo.model');
const { RemoveImageById } = require('./Image.controller');

// Add a new photo
exports.addPhoto = [
  async (req, res) => {
    console.log("addPhoto: Adding a new photo")
    try {
      const { name, type = 'General', image = "", description, isEnabled = true } = req.body;

      // Basic validation
      if (!name) {
        return res.status(400).json({
          isSuccess: false,
          message: 'Name and image URL are required.'
        });
      }

      // Check for duplicate image URL
      const existingPhoto = await Photo.findOne({ image });
      if (existingPhoto) {
        return res.status(409).json({
          isSuccess: false,
          message: 'Photo with this image URL already exists.'
        });
      }

      // Create and save new photo
      const newPhoto = new Photo({ name, type, image, description, isEnabled });
      const savedPhoto = await newPhoto.save();

      return res.status(201).json({
        isSuccess: true,
        message: 'Photo added successfully.',
        data: savedPhoto
      });

    } catch (err) {
      console.error('Error adding photo:', err);

      if (err.code === 11000) {
        return res.status(409).json({
          isSuccess: false,
          message: 'Duplicate key error - similar photo already exists.'
        });
      }

      return res.status(500).json({
        isSuccess: false,
        message: 'Internal server error.',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
      });
    }
  }
];


exports.getAllPhotosByIDAndTypeAll = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || req.body.id;
    const source = { ...req.query, ...req.body };
    const {
      type,
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      isEnabled,
      search
    } = source;

    console.log('getAllPhotosByIDAndTypeAll: Fetching photos', {
      id, type, page, limit, sort, order, isEnabled, search
    });

    const query = {};

    // ID filter
    if (id) {
      try {
        if (Array.isArray(id)) {
          query._id = { $in: id };
        } else {
          query._id = id;
        }
      } catch (err) {
        console.warn('Invalid ID format', { id });
        return res.status(400).json({
          isSuccess: false,
          message: 'Invalid ID format',
          invalidId: id
        });
      }
    }

    // Type filter (case-insensitive)
    if (type) {
      query.type = Array.isArray(type)
        ? { $in: type.map(t => new RegExp(`^${t}$`, 'i')) }
        : new RegExp(`^${type}$`, 'i');
    }

    // isEnabled filter
    if (isEnabled !== undefined) {
      query.isEnabled = isEnabled === 'true';
    }

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    const [photos, total] = await Promise.all([
      Photo.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Photo.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log(`getAllPhotosByIDAndTypeAll: Found ${photos.length} photos`);

    const response = {
      isSuccess: true,
      message: id ? 'Photo(s) fetched successfully' : 'All photos fetched successfully',
      data: photos,
      meta: {
        totalItems: total,
        itemCount: photos.length,
        itemsPerPage: parseInt(limit),
        totalPages,
        currentPage: parseInt(page),
        hasNext,
        hasPrev,
        filters: {
          id: id || 'all',
          type: type || 'all',
          isEnabled: isEnabled !== undefined ? isEnabled : 'all',
          search: search || 'none'
        },
        sort: {
          by: sort,
          order
        },
        // availableTypes: ['General', 'Nature', 'Event'] // customize as needed
      }
    };

    if (id && !Array.isArray(id) && photos.length === 1) {
      response.data = photos[0];
    }

    res.status(200).json(response);

  } catch (err) {
    console.error('getAllPhotosByIDAndTypeAll: Error', {
      error: err.message,
      stack: err.stack
    });

    const errorResponse = {
      isSuccess: false,
      message: 'Failed to fetch photos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    if (err.name === 'CastError') {
      errorResponse.message = 'Invalid ID format';
      return res.status(400).json(errorResponse);
    }

    if (err.name === 'MongoError') {
      errorResponse.message = 'Database operation failed';
      return res.status(503).json(errorResponse);
    }

    res.status(500).json(errorResponse);
  }
};



exports.updatePhoto = [
  async (req, res) => {
    const id = req.params.id || req.query.id || req.body.id;
    const { name, type, image, description, isEnabled } = req.body;

    console.log('updatePhoto: Attempting to update photo', {
      photoId: id,
      updates: { name, type, image, description, isEnabled }
    });

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('updatePhoto: Validation failed', { errors: errors.array() });
      return res.status(400).json({
        isSuccess: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    try {
      const existingPhoto = await Photo.findById(id);
      if (!existingPhoto) {
        console.warn('updatePhoto: Photo not found', { photoId: id });
        return res.status(404).json({
          isSuccess: false,
          message: 'Photo not found'
        });
      }

      // Check for duplicate image if changed
      if (image && image !== existingPhoto.image) {
        const duplicate = await Photo.findOne({ image });
        if (duplicate) {
          console.warn('updatePhoto: Duplicate image found', { image });
          return res.status(409).json({
            isSuccess: false,
            message: 'Photo with this image already exists'
          });
        }
      }

      // Prepare fields for update
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (type !== undefined) updateFields.type = type;
      if (image !== undefined) updateFields.image = image;
      if (description !== undefined) updateFields.description = description;
      if (isEnabled !== undefined) updateFields.isEnabled = isEnabled;

      // Perform update
      const updatedPhoto = await Photo.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      );

      console.log('updatePhoto: Photo updated successfully', { photoId: updatedPhoto._id });

      return res.status(200).json({
        isSuccess: true,
        message: 'Photo updated successfully',
        data: updatedPhoto
      });

    } catch (err) {
      console.error('updatePhoto: Database error', { error: err.message });

      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
          isSuccess: false,
          message: 'Duplicate key error - photo with similar unique field already exists'
        });
      }

      return res.status(500).json({
        isSuccess: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  }
];


exports.deletePhoto = async (req, res) => {
  const id = req.params.id || req.query.id || req.body.id;

  console.log('deletePhoto: Attempting to delete photo', {
    source: req.params.id ? 'params' : req.query.id ? 'query' : 'body',
    id
  });

  try {
    if (!id) {
      console.warn('deletePhoto: No photo ID provided');
      return res.status(400).json({
        isSuccess: false,
        message: 'Photo ID is required',
        error: 'MISSING_ID'
      });
    }

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn('deletePhoto: Invalid ID format', { id });
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid photo ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }
    // Delete image from filesystem
    await RemoveImageById(id);

    const deletedPhoto = await Photo.findByIdAndDelete(id);

    if (!deletedPhoto) {
      console.warn('deletePhoto: Photo not found', { id });
      return res.status(404).json({
        isSuccess: false,
        message: 'Photo not found',
        error: 'PHOTO_NOT_FOUND',
        id
      });
    }

    return res.status(200).json({
      isSuccess: true,
      message: 'Photo deleted successfully',
      data: { deletedPhoto }
    });

  } catch (err) {
    console.error('deletePhoto: Failed to delete', {
      id,
      error: err.message,
      stack: err.stack
    });

    if (err.name === 'CastError') {
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid photo ID',
        error: 'INVALID_ID',
        id
      });
    }

    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to delete photo',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      errorCode: 'SERVER_ERROR'
    });
  }
};
