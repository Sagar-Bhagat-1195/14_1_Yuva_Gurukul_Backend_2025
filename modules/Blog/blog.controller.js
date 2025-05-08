const Blog = require('./blog.model');
const slugify = require('slugify');

// Enhanced response handler
const sendResponse = (res, options) => {
    const { statusCode, isSuccess, message, data = null, error = null } = options;
    res.status(statusCode).json({
        isSuccess,
        message,
        ...(data && { data }),
        ...(error && { error }),
        timestamp: new Date().toISOString()
    });
};

// Blog Controller
exports.createBlog = async (req, res) => {
    try {
        const { title, content, author, category, tags, image, isEnabled } = req.body;

        // Basic validation
        if (!title || !content || !author) {
            return sendResponse(res, {
                statusCode: 400,
                isSuccess: false,
                message: 'Title, content, and author are required'
            });
        }

        // Generate slug if not provided
        const slug = req.body.slug || slugify(title, { lower: true, strict: true });

        const blog = new Blog({
            title,
            slug,
            content,
            author,
            category,
            tags: tags || [],
            image,
            isEnabled: isEnabled || false
        });

        await blog.save();

        sendResponse(res, {
            statusCode: 201,
            isSuccess: true,
            message: 'Blog created isSuccessfully',
            data: blog
        });
    } catch (error) {
        const statusCode = error.name === 'ValidationError' ? 422 : 500;
        sendResponse(res, {
            statusCode,
            isSuccess: false,
            message: 'Failed to create blog',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};

exports.getBlogsById_Slug_All = async (req, res) => {
    console.log("getBlogsById_Slug_All");
    console.log(req.body);

    try {
    
        const source = { ...req.query, ...req.body };  // merge both
        const {
            page = 1,
            limit = 10,
            category,
            tag,
            // published,
            search,   // search term for title or content
            slug
        } = source;


        const skip = (page - 1) * limit;

        // Check if ID is provided in params, query, or body
        const id = req.params.id || req.query.id || req.body.id;
        console.log(`[DEBUG] Attempting to process ID: ${id}`);

        // Build query
        const query = { isEnabled: true };

        if (id) query._id = id;
        if (slug) query.slug = slug;
        if (category) query.category = category;
        if (tag) query.tags = tag;
        // if (published !== undefined) query.isPublished = published === 'true';
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const [blogs, total] = await Promise.all([
            Blog.find(query)
                .sort({ createdAt: -1 })
                .skip(Number(skip))
                .limit(Number(limit)),
            Blog.countDocuments(query)
        ]);

        sendResponse(res, {
            statusCode: 200,
            success: true,
            message: 'Blogs fetched successfully',
            data: {
                blogs,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: 'Failed to fetch blogs',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};

// --------------------------------------------------------------------
exports.updateBlog = async (req, res) => {
    try {
       // Check if id is passed in params, query, or body
       const id = req.params.id || req.query.id || req.body.id;
        let updates = req.body;

        if (!id) {
            return sendResponse(res, {
                statusCode: 400,
                isSuccess: false,
                message: 'Blog ID is required'
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return sendResponse(res, {
                statusCode: 400,
                isSuccess: false,
                message: 'No update data provided'
            });
        }

        // Trim and remove empty string values
        Object.keys(updates).forEach(key => {
            if (typeof updates[key] === 'string') {
                updates[key] = updates[key].trim();
                if (updates[key] === '') {
                    delete updates[key];
                }
            }
        });

        // Whitelist allowed fields
        const allowedFields = ['title', 'content', 'author', 'category', 'tags', 'image', 'isEnabled'];
        updates = Object.fromEntries(
            Object.entries(updates).filter(([key]) => allowedFields.includes(key))
        );

        // Regenerate slug if title is being updated
        if (updates.title) {
            updates.slug = slugify(updates.title, { lower: true, strict: true });
        }

        // Ensure tags are always an array
        if (updates.tags && !Array.isArray(updates.tags)) {
            updates.tags = [updates.tags];
        }

        // Set default for isEnabled if not explicitly defined
        if (typeof updates.isEnabled === 'undefined') {
            updates.isEnabled = false;
        }

        const blog = await Blog.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });

        if (!blog) {
            return sendResponse(res, {
                statusCode: 404,
                isSuccess: false,
                message: 'Blog not found'
            });
        }

        sendResponse(res, {
            statusCode: 200,
            isSuccess: true,
            message: 'Blog updated successfully',
            data: blog
        });
    } catch (error) {
        const statusCode = error.name === 'ValidationError' ? 422 : 500;
        sendResponse(res, {
            statusCode,
            isSuccess: false,
            message: 'Failed to update blog',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};


exports.deleteBlog = async (req, res) => {
    try {
        // Get blog ID from params, query, or body
        const id = req.params.id || req.query.id || req.body.id;

        if (!id) {
            return sendResponse(res, {
                statusCode: 400,
                isSuccess: false,
                message: 'Blog ID is required'
            });
        }

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return sendResponse(res, {
                statusCode: 404,
                isSuccess: false,
                message: 'Blog not found'
            });
        }

        sendResponse(res, {
            statusCode: 200,
            isSuccess: true,
            message: 'Blog deleted successfully'
        });
    } catch (error) {
        sendResponse(res, {
            statusCode: 500,
            isSuccess: false,
            message: 'Failed to delete blog',
            error: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
        });
    }
};
