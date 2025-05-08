const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            default: 'General',
            trim: true,
        },
        tags: {
            type: [String],
            default: [],
        },
        image: {
            type: String, // URL or path to image
            default: null,
        },
        // isPublished: {
        //   type: Boolean,
        //   default: false,
        // },
        isEnabled: {
            type: Boolean,
            default: true, // Admin can manually enable/disable event
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Optional: auto-generate slug from title if not provided
blogSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    }
    next();
});

module.exports = mongoose.model('Blog', blogSchema);
