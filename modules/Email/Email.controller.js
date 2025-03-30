const { body, validationResult } = require("express-validator");
const Email = require("./Email.model");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config(); // Load environment variables

const { sendMail } = require("./emailService");

// Middleware for input validation
const validateEmail = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("subject").notEmpty().withMessage("Subject is required"),
  body("message").notEmpty().withMessage("Message is required"),
  body("mobile").notEmpty().withMessage("Mobile number is required"),
];

// API Endpoint to Add Email
exports.sendEmail = async (req, res) => {
  console.log("Adding new email entry...");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, subject, message } = req.body;

    // Send email before saving to DB
    const emailTemplatePath = path.join(__dirname, "../Email/index_OTP.html");
    let emailHtml = fs.existsSync(emailTemplatePath)
      ? fs.readFileSync(emailTemplatePath, "utf-8").replace(/{{NAME}}/g, name).replace(/{{OTP}}/g, "987654")
      : `<p>Hello ${name}, this is a test email.</p>`;

    await sendMail(email, subject, message, emailHtml);

    // Save to database
    const newEmail = await Email.create(req.body);
    res.status(201).json(newEmail);
  } catch (err) {
    console.error("Error in addEmail:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch all emails
exports.getEmail = async (req, res) => {
  console.log("Fetching all emails...");
  try {
    const emails = await Email.find();
    res.json(emails);
  } catch (err) {
    console.error("Error fetching emails:", err);
    res.status(500).json({ error: err.message });
  }
};

// Update email by ID
exports.updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmail = await Email.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedEmail) {
      return res.status(404).json({ error: "Email entry not found" });
    }

    res.json(updatedEmail);
  } catch (err) {
    console.error("Error updating email:", err);
    res.status(500).json({ error: err.message });
  }
};

// Delete email by ID
exports.deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEmail = await Email.findByIdAndDelete(id);

    if (!deletedEmail) {
      return res.status(404).json({ error: "Email entry not found" });
    }

    res.json({ message: "Email deleted successfully" });
  } catch (err) {
    console.error("Error deleting email:", err);
    res.status(500).json({ error: err.message });
  }
};

// Export validation middleware
exports.validateEmail = validateEmail;
