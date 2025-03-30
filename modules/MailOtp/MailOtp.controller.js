const MailOtp = require("./MailOtp.model");
const MailOtpRecord = require("./MailOtpRecord.model");
const User = require("../user/user.model");
const crypto = require("crypto");

const {
  sendMail,
  Gmail_Simple_Send,
  Gmail_Send_Html_File,
} = require("./MailOtp.EmailService");

exports.sendOtp = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.body.userId;
    let email = req.query.email || req.body.email;

    const user = await User.findOne({
      _id: userId,
      ...(email && { email }),
    });

    if (!user) {
      return res
        .status(404)
        .json({ isSuccess: false, message: "User not found" });
    }

    if (!email && email === user.email) {
      return res
        .status(400)
        .json({
          isSuccess: false,
          message: "Email Not matched with User Email...",
        });
    }
    if (!email) {
      email = user.email;
    }

    const OTP = crypto.randomInt(100000, 999999);
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    console.log(
      `Email: ${email}\nOTP: ${OTP}\nUser ID: ${userId}\nExpires At: ${expiresAt}`
    );

    const existingOtp = await MailOtp.findOne({ email });
    if (existingOtp) {
      await MailOtp.updateOne({ email }, { OTP, expiresAt, userId });
    } else {
      await MailOtp.create({ email, OTP, userId, expiresAt });
    }

    await Gmail_Send_Html_File(
      user.name,
      email,
      "OTP Verification",
      OTP,
      user.phone
    );

    res
      .status(201)
      .json({ isSuccess: true, message: "OTP sent successfully", OTP });
  } catch (error) {
    console.error("Error in sendOtp:", error.message);
    res
      .status(500)
      .json({
        isSuccess: false,
        message: "Internal Server Error",
        error: error.message,
      });
  }
};

// exports.verifyOtp = async (req, res) => {
//   try {
//     const userId = req.UserSecure_id || req.body.userId;
//     let { email = "", OTP = "" } = { ...req.query, ...req.body };

//     console.log(`Email: ${email}\nOTP: ${OTP}\nUser ID: ${userId}`);

//     const mailOtp = await MailOtp.findOne({ userId: userId, OTP });
//     if (!mailOtp) {
//       return res.status(400).json({ isSuccess: false, message: "Invalid OTP" });
//     }
//     if (!email) {
//       email = mailOtp.email;
//     }

//     console.log(`Email: ${email}\nOTP: ${OTP}\nUser ID: ${userId}`);

//     const user = await User.findOne({ _id: userId, email });
//     if (!user) {
//       return res
//         .status(404)
//         .json({ isSuccess: false, message: "User not found" });
//     }

//     if (mailOtp.expiresAt < new Date()) {
//       return res.status(400).json({ isSuccess: false, message: "OTP expired" });
//     }

//     await User.updateOne({ _id: userId }, { $unset: { expiresAt: 1 } });
//     await MailOtp.deleteOne({ email, OTP });

//     const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
//     await MailOtpRecord.create({ email, OTP, userId, expiresAt });

//     res
//       .status(200)
//       .json({ isSuccess: true, message: "OTP verified successfully" });
//   } catch (error) {
//     console.error("Error in verifyOtp:", error.message);
//     res
//       .status(500)
//       .json({
//         isSuccess: false,
//         message: "Internal Server Error",
//         error: error.message,
//       });
//   }
// };



exports.verifyOtp = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.body.userId;
    let { email = "", OTP = "" } = { ...req.query, ...req.body };

    console.log(`Email: ${email}\nOTP: ${OTP}\nUser ID: ${userId}`);

    const mailOtp = await MailOtp.findOne({ userId: userId, OTP });
    if (!mailOtp) {
      return res.status(400).json({ isSuccess: false, message: "Invalid OTP" });
    }
    if (!email) {
      email = mailOtp.email;
    }

    console.log(`Email: ${email}\nOTP: ${OTP}\nUser ID: ${userId}`);

    let user = await User.findOne({ _id: userId, email });
    if (!user) {
      return res.status(404).json({ isSuccess: false, message: "User not found" });
    }

    if (mailOtp.expiresAt < new Date()) {
      return res.status(400).json({ isSuccess: false, message: "OTP expired" });
    }

    await User.updateOne({ _id: userId }, { $unset: { expiresAt: 1 } });
    await MailOtp.deleteOne({ email, OTP });

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await MailOtpRecord.create({ email, OTP, userId, expiresAt });

    // ✅ Mark the user as verified
    await User.updateOne({ _id: userId }, { $set: { verified: true } });

    // Fetch the updated user details
    user = await User.findOne({ _id: userId }).select("-password"); // Exclude password for security

    res.status(200).json({
      isSuccess: true,
      message: "OTP verified successfully",
      user, // Include the user details in the response
    });
  } catch (error) {
    console.error("Error in verifyOtp:", error.message);
    res.status(500).json({
      isSuccess: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
