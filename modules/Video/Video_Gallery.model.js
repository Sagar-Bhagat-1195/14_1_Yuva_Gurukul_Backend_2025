const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true,
  },
  type: {
    type: String,
    required: true,
    // enum: ['Tech', 'Education', 'Entertainment', 'Travel', 'Music', 'Other'],
    default: 'General',
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', VideoSchema); // Avoid slashes in collection name
