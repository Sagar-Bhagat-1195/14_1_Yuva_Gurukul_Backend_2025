// models/MailOtp.model.js
const mongoose = require("mongoose");

const MailOTPSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            trim: true,
        },
        OTP: {
            type: Number,
            required: true,
            min: 100000,
            max: 999999,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 }, // Auto-delete expired OTPs
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("MailOtp", MailOTPSchema);
