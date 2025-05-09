const { validationResult } = require('express-validator');
const About = require('./About.model');


exports.createAbout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name = "", title = "", type = "", description = "" } = req.body;

    const about = new About({
      name: name.trim(),
      title: title.trim(),
      type: type.trim(),
      description: description.trim(),
    });

    const savedAbout = await about.save();
    res.status(201).json(savedAbout);
  } catch (error) {
    console.error("Error creating About:", error); // optional but helpful
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



exports.getAboutByIdOrAll = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || req.body.id;

    if (id) {
      const about = await About.findById(id);
      if (!about) {
        return res.status(404).json({ message: 'About not found' });
      }
      return res.status(200).json(about);
    } else {
      const abouts = await About.find();
      return res.status(200).json(abouts);
    }
  } catch (error) {
    console.error("Error fetching about data:", error);
    return res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


exports.updateAbout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, title, type, description, short_description, long_description, like } = req.body;
    const img_url = req.file ? req.file.path : req.body.img_url; // Use existing image if not updated
    const photo_gallery = req.files ? req.files.map(file => file.path) : req.body.photo_gallery || []; // Use existing gallery if not updated

    const about = await About.findByIdAndUpdate(
      req.params.id,
      { name, title, type, img_url, description, short_description, long_description, like, photo_gallery },
      { new: true }
    );

    if (!about) {
      return res.status(404).json({ error: 'About not found' });
    }

    res.status(200).json(about);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    const about = await About.findByIdAndDelete(req.params.id);
    if (!about) {
      return res.status(404).json({ error: 'About not found' });
    }
    res.status(200).json({ message: 'About deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
