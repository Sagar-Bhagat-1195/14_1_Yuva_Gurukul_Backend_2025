const { body, validationResult } = require("express-validator");
const Email = require("./Email.model");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../Email/index.html"); // ✅ Use absolute path

console.log("Checking file:", filePath);

if (!fs.existsSync(filePath)) {
  console.error("❌ File does not exist:", filePath);
} else {
  console.log("✅ File found!");
}


// Global Transporter Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "sagarbhagat00@gmail.com",
    pass: "pywf ovee nnxy wwaa", // Use an App Password,Google Account Chek, not your real password
  },
});

async function SendMailInit(email, name) {
  try {
    let info = await transporter.sendMail({
      from: "sagarbhagat00@gmail.com", // ✅ Corrected sender email
      to: email,
      subject: "Hello",
      text: `Hello ${name}, This is a test email.`,
    });

    console.log("Message sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function SendMailInit_Two(email, name) {
  try {
    const filePath = path.join(__dirname, "../Email/index_OTP_TIME_PHOTO.html"); // ✅ Use absolute path
    // const file = fs.readFileSync(filePath, "utf-8");//.replace("{{NAME}}", name);
    const file = fs.readFileSync(filePath, "utf-8").replace(/{{NAME}}/g, name);


    const info = await transporter.sendMail({
      from: "sagarbhagat00@gmail.com",
      to: email,
      subject: "Hello ✔",
      text: "Hello world?",
      html: file,
    });

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// API Endpoint to Add Email
exports.addEmail = async (req, res) => {
  console.log("add email.");
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Send email before saving it to DB
    // await SendMailInit(req.body.email, req.body.name);
    await SendMailInit_Two(req.body.email, req.body.name);

    // Save email record to DB
    const sendMail = await Email.create(req.body);

    res.json(sendMail);
  } catch (err) {
    console.error("Error in addEmail:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getEmail = async (req, res) => {
  console.log('getEmail: Fetching all Emails');
  try {
    const Emails = await Email.find();
    console.log('getEmails: Emails fetched successfully', Emails);
    res.json(Emails);
  } catch (err) {
    console.error('getEmails: Error fetching Emails', err);
    res.status(500).json({ error: err.message });
  }
};


// Update email by ID
exports.updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;

    // Find and update the email
    const updatedEmail = await Email.findByIdAndUpdate(id, { email, name }, { new: true });

    if (!updatedEmail) {
      return res.status(404).json({ error: "Email not found" });
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

    // Find and delete the email
    const deletedEmail = await Email.findByIdAndDelete(id);

    if (!deletedEmail) {
      return res.status(404).json({ error: "Email not found" });
    }

    res.json({ message: "Email deleted successfully" });
  } catch (err) {
    console.error("Error deleting email:", err);
    res.status(500).json({ error: err.message });
  }
};
