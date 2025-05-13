const { body, validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables

// Check if required environment variables are set
const MAIN_URL_BACKEND = process.env.MAIN_URL_BACKEND;
console.log("MAIN_URL_BACKEND:", MAIN_URL_BACKEND);
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
            ...(html && { html }), // Include HTML if available
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Message sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error; // Rethrow error for caller to handle
    }
}

/**
 * Sends an email with the Yuva Gurukul event ticket.
 * @param {string} email - Recipient email address.
 * @param {string} ticket - OTP or Ticket Code.
 * @param {string} name - Recipient name.
 */


const sendGmailTicket = async (email, ticket, name, eventName, eventImage) => {
    // image 
    // const image = 'http://localhost:3000/images/YuvaGurukul/GlobalEvent/' + eventImage;
    const image = MAIN_URL_BACKEND + 'images/YuvaGurukul/GlobalEvent/' + eventImage;
    console.log("eventImage :", image);
    try {
        if (!email) {
            throw new Error("Email is required");
        }

        // Load Email Template
        // const emailTemplatePath = path.join(__dirname, "../GmailTicketSend/index_OTP_TIME_PHOTO.html");// Use this for OTP
        const emailTemplatePath = path.join(__dirname, "../GmailTicketSend/EventGmail.html"); // Use this for Event Ticket
        // const emailTemplatePath = path.join(__dirname, "../GmailTicketSend/indexEventTicket.html");

        let emailHtml = `<p>Hello, this is a test email.</p>`; // Default fallback
        if (fs.existsSync(emailTemplatePath)) {
            emailHtml = await fs.promises.readFile(emailTemplatePath, "utf-8")
                .then(content => content.replace(/{{OTP}}/g, ticket).replace(/{{NAME}}/g, name).replace(/{{IMAGE}}/g, image))
                .catch(err => {
                    console.error("Error reading email template:", err);
                    return emailHtml; // Fallback in case of error
                });
        }

        // Send Email
        await sendMail(email, "Yuva Gurukul Ticket", "Jay Shree Ram", emailHtml);

        console.log("Email sent successfully to:", email);
        return { success: true, message: "Email sent successfully" };

    } catch (err) {
        console.error("Error sending email:", err);
        return { success: false, error: err.message };
    }
};


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
module.exports = { sendMail, Gmail_SendMail, sendGmailTicket };
