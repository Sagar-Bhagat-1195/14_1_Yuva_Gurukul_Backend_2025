const mongoose = require("mongoose");

// User Schema
const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    surname: { type: String, required: true, trim: true },
    avatar: { type: String, default: null }, // No need for trim on null values
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      index: true, // Ensure unique index at DB level
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // Ensure unique index at DB level
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Prevents password from being returned in queries
    },
    authToken: { type: String, default: null },
    expiresAt: {
      type: Date,
      index: { expires: 0 }, // Auto-delete expired OTPs
      // index: { expires: '1d' } // Auto-delete expired OTPs after 1 day
    },
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role", // Reference to Role model
    },
    userRole: {
      type: String,
      enum: ["superadmin", "admin", "user"],
      default: "user",
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual field to get full name
UserSchema.virtual("fullName").get(function () {
  return `${this.name} ${this.surname}`;
});

// Enable virtual fields in JSON output
UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("User", UserSchema);
