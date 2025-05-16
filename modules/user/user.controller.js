const bcrypt = require("bcrypt");
const User = require("./user.model"); // Updated to use the User model
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { RemoveUserAvatarById } = require("./Image.controller");

// Define your JWT secret
const JWT_SECRET_KEY =
  process.env.JWT_SECRET || "your_default_secret_here";
console.log("JWT_SECRET :", JWT_SECRET_KEY);

// Helper function to hash password
const hashPassword = async (password) => await bcrypt.hash(password, 10);

// Helper function to generate auth token
const generateAuthToken = async (userId) => {
  return await new Promise((resolve, reject) => {
    jwt.sign({ id: userId }, JWT_SECRET_KEY, (err, token) => {
      if (err) {
        reject(err);
      } else {
        resolve(token);
      }
    });
  });
};

// Sign Up Controller (Create a new User)
exports.SignUpp = async (req, res) => {
  try {
    const {
      name,
      surname,
      phone,
      email,
      password,
    } = req.body;

    // Check if user with the same email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email or phone already exists", isSuccess: false });
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);  // 2 minits

    // Create new user without authToken
    const newUser = new User({
      name,
      surname,
      phone,
      email,
      password: await hashPassword(password),
      expiresAt,
    });

    // Generate JWT token for the newly created user and assign it to newUser.authToken
    newUser.authToken = await generateAuthToken(newUser._id);

    await newUser.save();

    // Respond with the user data and auth token
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser, isSuccess: true });
  } catch (error) {
    res.status(500).json({ message: error.message, isSuccess: false });
    console.log("SignUp error:", error);
  }
};

// With-Out Password::
// Sign Up Controller (Create a new User)
exports.SignUp = async (req, res) => {
  try {
    const { name, surname, phone, email } = req.body;

    // Check if user with the same email or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or phone already exists",
        isSuccess: false,
      });
    }

    // Set expiration for user (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    // Create new user without password
    const newUser = new User({
      name,
      surname,
      phone,
      email,
      expiresAt,
    });

    // Generate JWT token
    const authToken = await generateAuthToken(newUser._id);
    newUser.authToken = authToken;

    await newUser.save();

    // Respond with only necessary data (avoid exposing sensitive fields)
    res.status(201).json({
      message: "User created successfully",
      // user: {
      //   id: newUser._id,
      //   name: newUser.name,
      //   surname: newUser.surname,
      //   phone: newUser.phone,
      //   email: newUser.email,
      //   userRole: newUser.userRole,
      //   authToken, // Send token separately
      // },
      user: newUser,
      authToken, // Send token separately
      isSuccess: true,
    });
  } catch (error) {
    console.error("SignUp error:", error);
    res.status(500).json({ message: "Server error", isSuccess: false });
  }
};


// Login Controller (Authenticate user)
exports.Login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    console.log(identifier);
    console.log(password);

    // Check if user exists by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found", isSuccess: false });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials", isSuccess: false });
    }

    // Generate auth token
    const token = await generateAuthToken(user._id);
    user.authToken = token;

    // Respond with the user data and token
    // res.status(200).json({ message: "Login successful", user, token, isSuccess: true });
    res.status(200).json({ message: "Login successful", user, isSuccess: true });
  } catch (error) {
    res.status(500).json({ message: error.message, isSuccess: false });
    console.log("Login error:", error);
  }
};

// SignIn Controller (Authenticate user)
exports.SignIn = async (req, res) => {
  try {
    const { identifier } = req.body;

    // Find user by email or phone
    const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });

    if (!user) {
      return res.status(404).json({ message: "User not found", isSuccess: false });
    }

    // Generate authentication token
    const token = await generateAuthToken(user._id);

    // Return user details without the password field
    const userResponse = await User.findById(user._id).select("-password");
    // const userResponse = await User.findById(user._id).select("authToken");

    // res.status(200).json({ message: "Login successful", user: userResponse, token, isSuccess: true });
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: userResponse._id,
        authToken: userResponse.authToken,
        userRole: userResponse.userRole
      },
      token, isSuccess: true
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error", isSuccess: false });
  }
};



// Update User (Update user details)
exports.Update = async (req, res) => {
  console.log("Update User Request Body:", req.body);
  try {
    const userId = req.UserSecure_id || req.params.id;
    const { name, surname, phone, email, password, avatar, roleId, userRole, isEnabled } = req.body;

    console.log("User ID:", userId);

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", isSuccess: false });
    }

    // Check if new email or phone already exists for another user
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail && existingEmail._id.toString() !== userId) {
        return res.status(400).json({ message: "Email already in use", isSuccess: false });
      }
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone && existingPhone._id.toString() !== userId) {
        return res.status(400).json({ message: "Phone number already in use", isSuccess: false });
      }
    }

    // Update user details while ensuring validations
    user.name = name?.trim() || user.name;
    user.surname = surname?.trim() || user.surname;
    user.phone = phone?.trim() || user.phone;
    user.email = email?.trim().toLowerCase() || user.email;
    user.avatar = avatar || user.avatar;
    user.roleId = roleId || user.roleId;
    user.userRole = userRole || user.userRole;
    user.isEnabled = isEnabled !== undefined ? isEnabled : user.isEnabled;

    // Hash the password if it's being updated
    if (password) {
      user.password = await hashPassword(password);
    }

    // Save the updated user
    await user.save();

    // Remove password from response
    const updatedUser = user.toObject();
    delete updatedUser.password;

    // Respond with the updated user details
    res.status(200).json({ message: "User updated successfully", user: updatedUser, isSuccess: true });
  } catch (error) {
    console.error("Update User error:", error);
    res.status(500).json({ message: "Server error", isSuccess: false });
  }
};

// Permanently Delete a User
exports.delete = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required", isSuccess: false });
    }

    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found", isSuccess: false });
    }

    if (!user.isEnabled) {
      return res.status(400).json({ message: "User is already disabled", isSuccess: false });
    }

    // remove user avatar if it exists
    // RemoveUserAvatarById(userId);

    // Delete user permanently
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted permanently", isSuccess: true });
  } catch (error) {
    console.error("Delete User Error:", error.message);
    res.status(500).json({ message: "Internal server error", isSuccess: false });
  }
};


// GetUser (Fetch User Details)
exports.GetUser = async (req, res) => {
  console.log("Get User Request Body:", req.body);
  try {
    const userId = req.UserSecure_id || req.params.id;
    const { data } = req.params;

    // Fetch the requesting user's role
    const requestingUser = await User.findById(userId).select("userRole");

    if (!requestingUser) {
      return res.status(404).json({ message: "Requesting user not found", isSuccess: false });
    }

    // If the user is `superadmin` or `admin`, they can retrieve all users
    if (["superadmin", "admin"].includes(requestingUser.userRole)) {
      if (data && data.toLowerCase() === "all") {
        console.log("Admin fetching all users...");
        // const users = await User.find().select("name email userRole");
        const user = await User.find();
        return res.status(200).json({ user, isSuccess: true, count: user.length });
      }
      else {
        // const user = await User.findById(userId).select("name email userRole");
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found", isSuccess: false });
        }
        return res.status(200).json({ user, isSuccess: true, count: user.length });
      }
    }


    // If the user is a normal `user`, they can only fetch their own data
    if (requestingUser.userRole === "user") {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found", isSuccess: false });
      }
      return res.status(200).json({ user, isSuccess: true, count: user.length });

    }

    return res.status(403).json({ message: "Unauthorized access", isSuccess: false });
  } catch (error) {
    console.error("Get User error:", error);
    res.status(500).json({ message: "Server error", isSuccess: false });
  }
};
