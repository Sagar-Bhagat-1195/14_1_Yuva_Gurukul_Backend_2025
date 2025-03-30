const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require("./user.model"); // Updated import to User model

// Define your JWT secret
const JWT_SECRET_KEY = process.env.REACT_APP_JWT_SECRET || "your_default_secret_here";
//console.log("JWT_SECRET:", JWT_SECRET_KEY);

const fetchUser = async (req, res, next) => {


  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');

  //console.log("Authorization:", authHeader);

  // Check if the Authorization header is not present or doesn't start with "Bearer"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied', isSuccess: false });
  }

  // Extract the token (removing "Bearer " from the header value)
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    //console.log(decoded);
    // Fetch the user using the decoded token payload
    const user = await User.findById(decoded.id);
    //console.log(user);

    if (!user) {
      return res.status(404).json({ message: 'User not found in auth-token', isSuccess: false });
    }

    // Attach the user ID to the request for later use
    //console.log("UserSecure_id:", decoded.id)
    req.UserSecure_id = decoded.id;

    next(); // Move to the next middleware or route handler
  } catch (err) {
    //console.error(err.message);
    res.status(401).json({ message: err.message, isSuccess: false });
  }
};

module.exports = fetchUser;
