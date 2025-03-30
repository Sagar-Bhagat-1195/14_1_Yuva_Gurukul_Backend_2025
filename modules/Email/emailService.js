const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Global Transporter Setup (Use environment variables for security)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Load from .env
        pass: process.env.EMAIL_PASS, // Load from .env
    },
});

// Utility function to send email
async function sendMail(to, subject, text, html = null) {
    try {
        let mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            ...(html && { html }), // Include HTML if provided
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Rethrow to be handled by caller
    }
}

async function Gmail_SendMail(name, from_Email, subject, message, mobile = null) {
    try {
        let emailContent = `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${from_Email}</p>
            <p><strong>subject:</strong> ${subject}</p>
            <p><strong>message:</strong> ${message}</p>
            ${mobile ? `<p><strong>Mobile:</strong> ${mobile}</p>` : ""}
      
        `;

        let textContent = `Name: ${name}\nEmail: ${from_Email}\n${mobile ? `Mobile: ${mobile}\n` : ""}Message: ${message}`;

        // Use sendMail function
        let info = await sendMail(
            process.env.EMAIL_USER, // Send email to your configured email
            subject,
            textContent,
            emailContent
        );

        console.log("Gmail_SendMail sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending Gmail_SendMail:", error);
        throw error;
    }
}



// Export the function for use in other files
module.exports = { sendMail, Gmail_SendMail };
