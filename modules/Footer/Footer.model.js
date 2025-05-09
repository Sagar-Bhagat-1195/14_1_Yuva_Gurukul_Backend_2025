const mongoose = require('mongoose');

const SocialLinkSchema = new mongoose.Schema({
  platform: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    trim: true,
    default: '',
  }
}, { _id: false });

const FooterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  image: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    trim: true,
    required: true,
    maxlength: 300,
  },
  phone: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
  },
  map: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  socialLinks: [SocialLinkSchema],
  isEnabled: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Footer', FooterSchema);
