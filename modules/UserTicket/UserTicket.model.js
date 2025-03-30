const mongoose = require("mongoose");

const UserTicketSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
    },
    fees: {
      type: Number,
      required: true,
      min: 0,
    },
    tickets: {
      type: [Number],
      required: true,
    }, // Array of ticket numbers
    numOfTickets: {
      type: Number,
      required: true,
      min: 1,
    },
    totalFees: {
      type: Number,
      required: true,
      min: 0,
      default: function () {
        return this.fees * this.numOfTickets;
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    GlobalEventId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserGlobalEvent",
      required: true,
    },
    expiresAt: {
      type: Date,
      // required: true,
      index: { expires: 0 }, // Auto-delete expired OTPs
    },
  },
  { timestamps: true }
);

const UserTicket = mongoose.model("UserTicket", UserTicketSchema);

module.exports = UserTicket;
