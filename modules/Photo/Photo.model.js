const mongoose = require('mongoose');

const PhotoSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  type: {
    type: String,
    required: true,
    default: 'General',
  },
  image: {
    type: String,
    required: true,
    default: "",
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Photo', PhotoSchema);
