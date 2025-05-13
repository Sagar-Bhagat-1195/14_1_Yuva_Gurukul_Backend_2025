const UserEventTicket = require("./UserTicket.model");
const UserGlobalEvent = require("../UserGlobalEvent/UserGlobalEvent.model");
const User = require("../user/user.model");

const { sendGmailTicket } = require("../GmailTicketSend/emailService");

// Create a new event ticket
exports.createUserTicket = async (req, res) => {
  console.log("Creating event ticket...");
  try {
    const userId = req.UserSecure_id || req.body.userId;
    const { numOfTickets, GlobalEventId } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    if (!GlobalEventId) {
      return res.status(400).json({ success: false, message: "GlobalEvent ID is required" });
    }
    if (!numOfTickets || numOfTickets <= 0) {
      return res.status(400).json({ success: false, message: "Invalid number of tickets" });
    }

    // Fetch event details
    const existingEvent = await UserGlobalEvent.findById(GlobalEventId).select("eventName fees");
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const expiresAt = new Date(Date.now() + 500 * 60 * 1000); // Set expiration (10 minutes)

    // Create a new ticket document
    const newTicket = new UserEventTicket({
      eventName: existingEvent.eventName,
      fees: existingEvent.fees,
      totalFees: existingEvent.fees * numOfTickets,
      userId,
      GlobalEventId,
      numOfTickets,
      expiresAt,
    });

    await newTicket.save();

    // ✅ Fetch all tickets for this user and event
    const allTickets = await UserEventTicket.find({ userId, GlobalEventId });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      ticket: newTicket,
      AllTicket: allTickets, // ✅ Corrected: Now contains the user's tickets for this event
    });

  } catch (error) {
    console.error("Error creating ticket:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};


//UserTicketConfirm controller
// exports.confirmUserTicket = async (req, res) => {
//   console.log("Confirming event ticket.......");
//   try {
//     const userId = req.UserSecure_id || req.body.userId;
//     if (!userId) {
//       return res.status(400).json({ error: "User ID is required" });
//     }

//     const { GlobalEventId, ticketId } = req.body;

//     if (!GlobalEventId || !ticketId) {
//       return res.status(400).json({ message: "GlobalEventId and ticketId are required." });
//     }

//     const ticket = await UserEventTicket.findById(ticketId);
//     if (!ticket) {
//       return res.status(404).json({ success: false, message: "Ticket not found" });
//     }

//     const { numOfTickets, fees, eventName } = ticket;


//     // Check if expiresAt exists in the ticket
//     const expiresAtEvent = await UserEventTicket.findById(ticketId, { expiresAt: 1 });

//     if (!expiresAtEvent) {
//       return res.status(404).json({ message: "Ticket not found" });
//     }

//     // Check if the expiresAt field exists
//     if (!expiresAtEvent.expiresAt) {
//       // return res.status(404).json({ message: "expiresAt field not available" });
//       return res.status(404).json({ message: "Ticket already confirmed......." });
//     }

//     console.log("ExpiresAt:", expiresAtEvent.expiresAt);



//     // Fetch the latest ticket number from the event
//     const existingEvent = await UserGlobalEvent.findById(GlobalEventId, { ticketNumber: 1 });
//     if (!existingEvent) {
//       return res.status(404).json({ message: "Event not found" });
//     }

//     console.log("Existing Ticket Number:", existingEvent.ticketNumber);

//     const lastTicketNumber = existingEvent.ticketNumber || 0;

//     // Generate new ticket numbers
//     const newTicketNumbers = Array.from({ length: numOfTickets }, (_, i) => lastTicketNumber + i + 1);
//     console.log("New Ticket Numbers:", newTicketNumbers);

//     //-------------------------------------------------------------------------------------------
//     const user = await User.findById(userId, "email name surname"); // Select specific fields
//     if (!user) {
//       return { success: false, message: "User not found" };
//     }
//     console.log("user : ", user);

//     const ticketString = `[ ${newTicketNumbers.join(", ")} ]`;
//     console.log("ticketString : ", ticketString);

//     // await sendGmailTicket("sagarbhagat00@gmail.com", "1,2,3,4,5,6", "Sagar Bhagat");
//     await sendGmailTicket(user.email, ticketString, user.name + " " + user.surname);

//     // Update the event's ticketNumber
//     await UserGlobalEvent.findByIdAndUpdate(GlobalEventId, { $inc: { ticketNumber: numOfTickets } });

//     // Confirm ticket by removing expiration field and adding the generated tickets
//     const updatedTicket = await UserEventTicket.findByIdAndUpdate(
//       ticketId,
//       {
//         $unset: { expiresAt: "" }, // Ensure it removes the field properly
//         $set: { tickets: newTicketNumbers } // Store the generated ticket numbers
//       },
//       { new: true }
//     );

//     if (!updatedTicket) {
//       return res.status(404).json({ message: "Ticket not found or already confirmed" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Ticket confirmed successfully",
//       updatedTicket
//     });

//   } catch (error) {
//     console.error("Error confirming ticket:", error);
//     res.status(500).json({ success: false, message: "Internal server error", error: error.message });
//   }
// };

//UserTicketConfirm controller
exports.confirmUserTicket = async (req, res) => {
  console.log("Confirming event ticket.......");
  try {
    const userId = req.UserSecure_id || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { GlobalEventId, ticketId } = req.body;

    if (!GlobalEventId || !ticketId) {
      return res.status(400).json({ message: "GlobalEventId and ticketId are required." });
    }

    const ticket = await UserEventTicket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    const { numOfTickets, fees, eventName } = ticket;

    // Check if expiresAt exists in the ticket
    const expiresAtEvent = await UserEventTicket.findById(ticketId, { expiresAt: 1 });

    if (!expiresAtEvent) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Check if the expiresAt field exists
    if (!expiresAtEvent.expiresAt) {
      return res.status(404).json({ message: "Ticket already confirmed......." });
    }

    console.log("ExpiresAt:", expiresAtEvent.expiresAt);

    // Fetch the latest ticket number from the event
    const existingEvent = await UserGlobalEvent.findById(GlobalEventId, { ticketNumber: 1 ,image: 1,eventName: 1});
    console.log("existingEvent : ", existingEvent);

    if (!existingEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Existing Ticket Number:", existingEvent.ticketNumber);

    const lastTicketNumber = existingEvent.ticketNumber || 0;

    // Generate new ticket numbers
    const newTicketNumbers = Array.from({ length: numOfTickets }, (_, i) => lastTicketNumber + i + 1);
    console.log("New Ticket Numbers:", newTicketNumbers);

    //-------------------------------------------------------------------------------------------
    const user = await User.findById(userId, "email name surname"); // Select specific fields
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.log("user : ", user);

    const ticketString = `[ ${newTicketNumbers.join(", ")} ]`;
    console.log("ticketString : ", ticketString);

    await sendGmailTicket(user.email, ticketString, user.name + " " + user.surname,existingEvent.eventName,existingEvent.image);

    // Update the event's ticketNumber
    await UserGlobalEvent.findByIdAndUpdate(GlobalEventId, { $inc: { ticketNumber: numOfTickets } });

    // Confirm ticket by removing expiration field and adding the generated tickets
    const updatedTicket = await UserEventTicket.findByIdAndUpdate(
      ticketId,
      {
        $unset: { expiresAt: "" }, // Ensure it removes the field properly
        $set: { tickets: newTicketNumbers } // Store the generated ticket numbers
      },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found or already confirmed" });
    }

    // Fetch all tickets for the user and event
    const tickets = await UserEventTicket.find({ userId, GlobalEventId });

    res.status(200).json({
      success: true,
      message: "Ticket confirmed successfully",
      updatedTicket,
      tickets
    });

  } catch (error) {
    console.error("Error confirming ticket:", error);
    res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};



// Get all user event tickets by GlobalEventId (optional)
exports.getAllUserEventsById = async (req, res) => {
  try {
    const userId = req.UserSecure_id; // Get user ID from authentication middleware
    const GlobalEventId = req.body.GlobalEventId || req.params.GlobalEventId;
    const GetEventAllTicket = req.body.GetEventAllTicket|| req.params.GetEventAllTicket === "true";

    console.log("User ID:", userId);
    console.log("GlobalEventId:", GlobalEventId);
    console.log("GetEventAllTicket:", GetEventAllTicket);

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }
    if (!GlobalEventId) {
      return res.status(400).json({ success: false, message: "GlobalEvent ID is required" });
    }

    const existingEvent = await UserGlobalEvent.findById(GlobalEventId).select("eventName fees");
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    let tickets = [];

    if (GetEventAllTicket) {
      tickets = await UserEventTicket.find({ GlobalEventId });
    } else {
      tickets = await UserEventTicket.find({ userId, GlobalEventId });
    }

    // Send success even if tickets array is empty
    res.status(200).json({
      success: true,
      tickets,
    });

  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



// Update a ticket
exports.updateTicket = async (req, res) => {
  try {
    const { eventName, fees, tickets, totalFees } = req.body;
    const updatedTicket = await UserEventTicket.findByIdAndUpdate(
      req.params.id,
      { eventName, fees, tickets, totalFees },
      { new: true }
    );

    if (!updatedTicket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a ticket
exports.deleteTicket = async (req, res) => {
  try {
    const deletedTicket = await UserEventTicket.findByIdAndDelete(req.params.id);
    if (!deletedTicket) return res.status(404).json({ message: "Ticket not found" });

    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
