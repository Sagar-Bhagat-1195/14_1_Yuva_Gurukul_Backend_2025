const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      enum: ["superadmin", "admin", "user", "client", "general"],
      default: "general",
      required: true,
    },
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    general: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Reference to the user who owns this role
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", RoleSchema);
