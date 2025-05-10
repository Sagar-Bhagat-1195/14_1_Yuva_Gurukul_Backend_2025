const { validationResult } = require('express-validator');
const About = require('./About.model');

exports.createAbout = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ isSuccess: false, errors: errors.array() });
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
    res.status(201).json({ isSuccess: true, data: savedAbout });
  } catch (error) {
    console.error("Error creating About:", error);
    res.status(500).json({ isSuccess: false, message: "Server Error", error: error.message });
  }
};

exports.getAboutByIdOrAll = async (req, res) => {
  try {
    const id = req.params.id || req.query.id || req.body.id;
    const type = req.params.type || req.query.type || req.body.type;

    if (id) {
      const about = await About.findById(id);
      if (!about) {
        return res.status(404).json({ isSuccess: false, message: 'About not found' });
      }
      return res.status(200).json({ isSuccess: true, data: about });
    } else {
      const query = {};
      if (type) {
        query.type = Array.isArray(type)
          ? { $in: type.map(t => new RegExp(`^${t}$`, 'i')) }
          : new RegExp(`^${type}$`, 'i');
      }

      const abouts = await About.find(query);
      return res.status(200).json({ isSuccess: true, data: abouts });
    }
  } catch (error) {
    console.error("Error fetching about data:", error);
    return res.status(500).json({ isSuccess: false, message: 'Server Error', error: error.message });
  }
};

exports.updateAbout = async (req, res) => {
  const id = req.params.id || req.query.id || req.body.id;

  if (!id) {
    return res.status(400).json({ isSuccess: false, message: "ID is required" });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ isSuccess: false, errors: errors.array() });
  }

  try {
    const updates = {};
    const stringFields = ['name', 'title', 'type', 'description'];

    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field].trim();
      }
    });

    if (req.body.isEnabled !== undefined) {
      updates.isEnabled = Boolean(req.body.isEnabled);
    }

    const updatedAbout = await About.findByIdAndUpdate(id, updates, { new: true });

    if (!updatedAbout) {
      return res.status(404).json({ isSuccess: false, message: "About not found" });
    }

    return res.status(200).json({ isSuccess: true, data: updatedAbout });
  } catch (error) {
    console.error("Error updating About:", error);
    return res.status(500).json({ isSuccess: false, message: "Server Error", error: error.message });
  }
};

exports.deleteAbout = async (req, res) => {
  const id = req.params.id || req.query.id || req.body.id;

  if (!id) {
    return res.status(400).json({ isSuccess: false, message: "ID is required" });
  }

  try {
    const deletedAbout = await About.findByIdAndDelete(id);

    if (!deletedAbout) {
      return res.status(404).json({ isSuccess: false, message: "About not found" });
    }

    return res.status(200).json({
      isSuccess: true,
      message: "About deleted successfully",
      data: deletedAbout,
    });
  } catch (error) {
    console.error("Error deleting About:", error);
    return res.status(500).json({ isSuccess: false, message: "Server Error", error: error.message });
  }
};
