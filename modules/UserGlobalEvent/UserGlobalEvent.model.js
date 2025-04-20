const mongoose = require("mongoose");

const UserGlobalEventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    ticketNumber: {
      type: Number,
      min: [1, "Ticket number must be at least 1"],
      default: 1,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      trim: true,
      default: " ", // Default empty string if no image provided
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.startDate;
        },
        message: "End date must be after or equal to the start date.",
      },
    },
    runningEvent: {
      type: Boolean,
      default: false, // Automatically updates
    },
    active: {
      type: Boolean,
      default: false, // True when event is running
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "disabled"],
      default: "upcoming",
    },
    isEnabled: {
      type: Boolean,
      default: true, // Admin can manually enable/disable event
    },
    userIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    userEventTicket: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserEventTicket",
      },
    ],
  },
  { timestamps: true }
);

// Middleware: Automatically update `status`, `active`, and `runningEvent` before saving
UserGlobalEventSchema.pre("save", function (next) {
  const now = new Date();

  if (!this.isEnabled) {
    this.status = "disabled";
    this.runningEvent = false;
    this.active = false;
  } else if (now < this.startDate) {
    this.status = "upcoming";
    this.runningEvent = false;
    this.active = false;
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = "ongoing";
    this.runningEvent = true;
    this.active = true;
  } else {
    this.status = "completed";
    this.runningEvent = false;
    this.active = false;
  }

  next();
});

// Indexes for efficient queries
UserGlobalEventSchema.index({ startDate: 1 });
UserGlobalEventSchema.index({ userIds: 1, startDate: 1 });

const UserGlobalEvent = mongoose.model("UserGlobalEvent", UserGlobalEventSchema);

module.exports = UserGlobalEvent;
