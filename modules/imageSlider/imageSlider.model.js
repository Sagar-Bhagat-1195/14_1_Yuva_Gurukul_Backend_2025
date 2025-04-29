const mongoose = require('mongoose');

const imageSliderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  image: {
    type: String,
    default: "",
    // validate: {
    //   validator: function(v) {
    //     return v === "" || /^(https?:\/\/).+$/.test(v);
    //   },
    //   message: 'Please provide a valid URL starting with http:// or https://'
    // }
  },
  link: {
    type: String,
    default: "",
    // validate: {
    //   validator: function(v) {
    //     return v === "" || /^(https?:\/\/).+$/.test(v);
    //   },
    //   message: 'Please provide a valid URL starting with http:// or https://'
    // }
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative'],
    index: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, { 
  timestamps: true,
  versionKey: false
});

// Auto-increment order for new items
imageSliderSchema.pre('save', async function(next) {
  if (this.isNew && this.order === 0) {
    const lastItem = await this.constructor.findOne().sort('-order');
    this.order = lastItem ? lastItem.order + 1 : 1;
  }
  next();
});

// Reorder remaining items after deletion
imageSliderSchema.post('deleteOne', { document: true }, async function() {
  await this.constructor.updateMany(
    { order: { $gt: this.order } },
    { $inc: { order: -1 } }
  );
});

module.exports = mongoose.model('ImageSlider', imageSliderSchema);