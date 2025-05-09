const mongoose = require("mongoose");

const AboutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
  },
  image: {
    type: String,
    default: null
  },
  description: {
    type: String,
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  isEnabled: {
    type: Boolean,
    default: true, // Admin can manually enable/disable event
  },
}, { timestamps: true });

module.exports = mongoose.model("About", AboutSchema);
