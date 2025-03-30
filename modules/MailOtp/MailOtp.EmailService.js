const { body, validationResult } = require("express-validator");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../Email/index_OTP.html");

console.log("Checking file:", filePath);

if (!fs.existsSync(filePath)) {
    console.error("❌ File does not exist:", filePath);
} else {
    console.log("✅ File found!");
}

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
        console.error("Error sending email:", error.message);
        throw new Error("Failed to send email: " + error.message); // Rethrow to be handled by caller
    }
}

async function Gmail_Simple_Send(name, from_Email, subject, message, mobile = null) {
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

        console.log("Gmail_Simple_Send sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending Gmail_Simple_Send:", error.message);
        throw new Error("Failed to send Gmail_Simple_Send: " + error.message); // Rethrow error
    }
}

// Function to send an email with an HTML template
async function Gmail_Send_Html_File(name, from_Email, subject, message, mobile = null) {
    try {
        if (!name || !from_Email || !subject || !message) {
            throw new Error("Missing required parameters for sending email.");
        }

        // Convert message to a string
        const messageStr = String(message);

        // Path to the email template
        const emailTemplatePath = path.join(__dirname, "../MailOtp/index_MailOtp.html");

        // Check if the template file exists and read its content
        let emailHtml;
        if (fs.existsSync(emailTemplatePath)) {
            emailHtml = fs.readFileSync(emailTemplatePath, "utf-8");
        } else {
            console.warn("Email template not found. Sending plain text email.");
            emailHtml = `<p>Hello ${name}, this is a test email.</p>`;
        }

        // Replace placeholders (if any)
        emailHtml = emailHtml.replace(/{{NAME}}/g, name).replace(/{{OTP}}/g, messageStr).replace(/{{SUBJECT}}/g, subject);

        // Use from_Email as the recipient
        await sendMail(from_Email, subject, messageStr, emailHtml);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error in Gmail_Send_Html_File:", error.message);
    }
}

module.exports = { sendMail, Gmail_Simple_Send, Gmail_Send_Html_File };
