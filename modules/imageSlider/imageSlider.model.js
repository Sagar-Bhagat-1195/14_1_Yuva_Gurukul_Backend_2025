const mongoose = require('mongoose');

const imageSliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
  },
  img_url: {
    type: String,
    required: true,
  },
  link: {
    type: String,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('ImageSlider', imageSliderSchema);
