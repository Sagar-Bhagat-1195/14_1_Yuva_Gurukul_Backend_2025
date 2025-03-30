const fs = require("fs");
const path = require("path");
const { sendMail } = require("./emailService"); // Ensure sendMail is correctly imported

exports.GmailTicketSend = async (req, res) => {
  console.log("Gmail Ticket Send Email...");
  try {
    const email = req.query.email || req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    console.log("Email:", email);

    // Read Email Template
    const emailTemplatePath = path.join(__dirname, "../GmailTicketSend/index_OTP_TIME_PHOTO.html");

    let emailHtml;
    if (fs.existsSync(emailTemplatePath)) {
      emailHtml = fs.readFileSync(emailTemplatePath, "utf-8")
        .replace(/{{OTP}}/g, "9,8,7,4")
        .replace(/{{NAME}}/g, "Sagar Bhagat");

    } else {
      emailHtml = `<p>Hello, this is a test email.</p>`;
    }

    // Send Email
    await sendMail(email, "Yuva Gurukul Ticket", "jay Shree Ram ", emailHtml);

    res.status(200).json({ success: true, message: "Email sent successfully" });

  } catch (err) {
    console.error("Error sending email:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
