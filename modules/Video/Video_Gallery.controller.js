const { body, validationResult } = require('express-validator');
const Video = require('./Video_Gallery.model');

exports.addVideo = [
  async (req, res) => {
    const { name, title, type, url, isEnabled } = req.body;
    
    console.log('addVideo: Attempting to add new video', { name, title, type, isEnabled });

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('addVideo: Validation failed', { errors: errors.array() });
      return res.status(400).json({ 
        isSuccess: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    try {
      // Check if video with same URL already exists
      const existingVideo = await Video.findOne({ url });
      if (existingVideo) {
        console.warn('addVideo: Video with this URL already exists', { url });
        return res.status(409).json({
          isSuccess: false,
          message: 'Video with this URL already exists'
        });
      }

      // Create and save new video with isEnabled (default to true if not provided)
      const newVideo = new Video({ 
        name, 
        title, 
        type, 
        url, 
        isEnabled: isEnabled !== undefined ? isEnabled : true // Default to true
      });
      
      const savedVideo = await newVideo.save();
      
      console.log('addVideo: Video added successfully', { videoId: savedVideo._id });
      
      return res.status(201).json({
        isSuccess: true,
        message: 'Video added successfully',
        data: savedVideo
      });

    } catch (err) {
      console.error('addVideo: Database error', { error: err.message, stack: err.stack });
      
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
          isSuccess: false,
          message: 'Duplicate key error - video with similar unique field already exists'
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

exports.getAllVideosByIDAndTypeAll = async (req, res) => {
  try {
    // Extract parameters from all possible sources
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

    console.log('getAllVideosByIDAndTypeAll: Fetching videos', {
      id, type, page, limit, sort, order, isEnabled, search
    });

    // Build the query object
    const query = {};

    // ID filter (if provided)
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

    // Case-insensitive type filter (if provided)
    if (type) {
      query.type = Array.isArray(type) 
        ? { $in: type.map(t => new RegExp(`^${t}$`, 'i')) }
        : new RegExp(`^${type}$`, 'i');
    }

    // Enabled status filter (if provided)
    if (isEnabled !== undefined) {
      query.isEnabled = isEnabled === 'true';
    }

    // Search filter (if provided)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort options
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = { [sort]: sortOrder };

    // Execute the query with pagination
    const [videos, total] = await Promise.all([
      Video.find(query)
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean(),
      Video.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    console.log(`getAllVideosByIDAndTypeAll: Found ${videos.length} videos`);

    // Prepare response
    const response = {
      isSuccess: true,
      message: id ? 'Video(s) fetched successfully' : 'All videos fetched successfully',
      data: videos,
      meta: {
        totalItems: total,
        itemCount: videos.length,
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
        // Add available types for client reference
        availableTypes: ['web', 'mobile', 'desktop'] // Update with your actual types
      }
    };

    // Special case: Single video by ID
    if (id && !Array.isArray(id) && videos.length === 1) {
      response.data = videos[0];
    }

    res.status(200).json(response);

  } catch (err) {
    console.error('getAllVideosByIDAndTypeAll: Error', {
      error: err.message,
      stack: err.stack
    });

    const errorResponse = {
      isSuccess: false,
      message: 'Failed to fetch videos',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    };

    // Handle specific error types
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


exports.updateVideo = [
  async (req, res) => {
    // const { id } = req.params;
    const id = req.params.id || req.query.id || req.body.id;
    const { name, title, type, url, isEnabled } = req.body;
    
    console.log('updateVideo: Attempting to update video', { 
      videoId: id, 
      updates: { name, title, type, url, isEnabled } 
    });

    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn('updateVideo: Validation failed', { errors: errors.array() });
      return res.status(400).json({ 
        isSuccess: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    try {
      // Check if video exists
      const existingVideo = await Video.findById(id);
      if (!existingVideo) {
        console.warn('updateVideo: Video not found', { videoId: id });
        return res.status(404).json({
          isSuccess: false,
          message: 'Video not found'
        });
      }

      // If URL is being updated, check for duplicates
      if (url && url !== existingVideo.url) {
        const duplicateVideo = await Video.findOne({ url });
        if (duplicateVideo) {
          console.warn('updateVideo: Video with this URL already exists', { url });
          return res.status(409).json({
            isSuccess: false,
            message: 'Video with this URL already exists'
          });
        }
      }

      // Prepare update fields (only include provided fields)
      const updateFields = {};
      if (name !== undefined) updateFields.name = name;
      if (title !== undefined) updateFields.title = title;
      if (type !== undefined) updateFields.type = type;
      if (url !== undefined) updateFields.url = url;
      if (isEnabled !== undefined) updateFields.isEnabled = isEnabled;

      // Update video
      const updatedVideo = await Video.findByIdAndUpdate(
        id,
        updateFields,
        { new: true, runValidators: true }
      );
      
      console.log('updateVideo: Video updated successfully', { videoId: updatedVideo._id });
      
      return res.status(200).json({
        isSuccess: true,
        message: 'Video updated successfully',
        data: updatedVideo
      });

    } catch (err) {
      console.error('updateVideo: Database error', { error: err.message, stack: err.stack });
      
      if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
          isSuccess: false,
          message: 'Duplicate key error - video with similar unique field already exists'
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

exports.deleteVideo = async (req, res) => {
  // Support ID from params, query, or body
  const id = req.params.id || req.query.id || req.body.id;
  
  console.log('deleteVideo: Attempting to delete video', { 
    source: req.params.id ? 'params' : req.query.id ? 'query' : 'body',
    id 
  });

  try {
    // Validate ID exists
    if (!id) {
      console.warn('deleteVideo: No video ID provided');
      return res.status(400).json({
        isSuccess: false,
        message: 'Video ID is required',
        error: 'MISSING_ID'
      });
    }

    // Validate MongoDB ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.warn('deleteVideo: Invalid ID format', { id });
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid video ID format',
        error: 'INVALID_ID_FORMAT'
      });
    }

    const deletedVideo = await Video.findByIdAndDelete(id);
    
    if (!deletedVideo) {
      console.warn('deleteVideo: Video not found', { id });
      return res.status(404).json({
        isSuccess: false,
        message: 'Video not found',
        error: 'VIDEO_NOT_FOUND',
        id
      });
    }

    // console.log('deleteVideo: Successfully deleted', {
    //   id: deletedVideo._id,
    //   title: deletedVideo.title,
    //   type: deletedVideo.type
    // });

    return res.status(200).json({
      isSuccess: true,
      message: 'Video deleted successfully',
      data: {
        // id: deletedVideo._id,
        // title: deletedVideo.title,
        // type: deletedVideo.type,
        // deletedAt: new Date()
        deletedVideo
      }
    });

  } catch (err) {
    console.error('deleteVideo: Failed to delete', {
      id,
      error: err.message,
      stack: err.stack
    });

    // Handle specific error types
    if (err.name === 'CastError') {
      return res.status(400).json({
        isSuccess: false,
        message: 'Invalid video ID',
        error: 'INVALID_ID',
        id
      });
    }

    return res.status(500).json({
      isSuccess: false,
      message: 'Failed to delete video',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      errorCode: 'SERVER_ERROR'
    });
  }
};