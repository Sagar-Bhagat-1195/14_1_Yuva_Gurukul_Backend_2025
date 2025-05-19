const UserGlobalEvent = require("./UserGlobalEvent.model");
const User = require("../user/user.model");
const mongoose = require("mongoose");
const { RemoveUserGlobalEventImageById } = require("./Image.controller");

// Create a new User Global Event
exports.createUserGlobalEvent = async (req, res) => {
  try {
    const {
      eventName,
      fees,
      image = "",
      description,
      startDate,
      endDate,
      ticketNumber,
      address,
      userId: bodyUserId,
    } = req.body;

    const userId = req.UserSecure_id || bodyUserId;

    if (!userId) {
      return res.status(400).json({
        isSuccess: false,
        message: "User ID is required.",
      });
    }

    // Check required fields
    const missingFields = [];
    if (!eventName) missingFields.push("eventName");
    if (fees === undefined) missingFields.push("fees");
    if (!description) missingFields.push("description");
    if (!startDate) missingFields.push("startDate");
    if (!endDate) missingFields.push("endDate");
    if (ticketNumber === undefined) missingFields.push("ticketNumber");
    if (!address) missingFields.push("address");

    if (missingFields.length > 0) {
      return res.status(400).json({
        isSuccess: false,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Parse and validate number fields
    const parsedFees = Number(fees);
    const parsedTickets = Number(ticketNumber);

    if (isNaN(parsedFees) || parsedFees < 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "Fees must be a valid non-negative number.",
      });
    }

    if (isNaN(parsedTickets) || parsedTickets <= 0) {
      return res.status(400).json({
        isSuccess: false,
        message: "Ticket number must be a valid positive number.",
      });
    }

    // Validate and convert dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid date format for startDate or endDate.",
      });
    }

    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({
        isSuccess: false,
        message: "End date must be after or equal to start date.",
      });
    }

    // Save event to DB
    const newGlobalEvent = new UserGlobalEvent({
      eventName,
      fees: parsedFees,
      image,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      ticketNumber: parsedTickets,
      address,
      userIds: [userId],
    });

    await newGlobalEvent.save();

    // Fetch all events
    const allGlobalEvents = await UserGlobalEvent.find();

    res.status(201).json({
      isSuccess: true,
      message: "Event created successfully.",
      GlobalEvent: newGlobalEvent,
      AllGlobalEvent: allGlobalEvents,
    });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({
      isSuccess: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};



// Get all User Global Events or a single event
exports.getAllUserGlobalEvent = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.body.userId;
    const userRole = req.userRole || req.body.userRole;

    if (!userId) {
      return res.status(400).json({ isSuccess: false, message: "User ID is required." });
    }

    if (req.params.id) {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ isSuccess: false, message: "Invalid Event ID." });
      }

      const event = await UserGlobalEvent.findById(req.params.id).populate("userIds", "name email");

      if (!event) {
        return res.status(404).json({ isSuccess: false, message: "Event not found or access denied." });
      }

      return res.json({ isSuccess: true, event });
    }


    // Check user role/authorization
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    let filter = {};
    if (!["admin", "superadmin"].includes(user.userRole)) {
      filter = { isEnabled: true };
    }

    // const GlobalEvent = await UserGlobalEvent.find(filter).populate("userIds", "name email");
    const GlobalEvent = await UserGlobalEvent.find(filter);

    res.json({ isSuccess: true, GlobalEvent });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ isSuccess: false, message: "Internal server error", error: error.message });
  }
};


// Update a User Global Event
exports.updateUserGlobalEvent = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.body.userId;
    const EventID = req.params.id || req.body.id || req.query.id;

    console.log("Event ID:", EventID);
    console.log("User ID:", userId);

    // Validate IDs
    if (!EventID || !mongoose.Types.ObjectId.isValid(EventID)) {
      return res.status(400).json({ isSuccess: false, message: "Invalid or missing Event ID." });
    }

    if (!userId) {
      return res.status(400).json({ isSuccess: false, message: "User ID is required." });
    }

    // Prepare fields to update
    const {
      eventName,
      fees,
      image,
      description,
      startDate,
      endDate,
      ticketNumber,
      address,
      isEnabled,
    } = req.body;

    console.log("Request Body:", req.body);

    const updateFields = {};

    if (eventName) updateFields.eventName = eventName;
    if (fees !== undefined) updateFields.fees = Number(fees);
    if (image) updateFields.image = image;
    if (description) updateFields.description = description;
    if (startDate) updateFields.startDate = new Date(startDate);
    if (endDate) updateFields.endDate = new Date(endDate);
    if (address) updateFields.address = address;
    if (isEnabled !== undefined) updateFields.isEnabled = isEnabled;


    console.log("Update Fields:", updateFields);

    if (ticketNumber !== undefined) {
      const ticketNum = Number(ticketNumber);
      if (isNaN(ticketNum) || ticketNum <= 0) {
        return res.status(400).json({ isSuccess: false, message: "Invalid ticket number." });
      }
      updateFields.ticketNumber = ticketNum;
    }

    // Update event
    const event = await UserGlobalEvent.findOneAndUpdate(
      { _id: EventID },
      updateFields,
      { new: true }
    );

    await event.save();

    if (!event) {
      return res.status(404).json({ isSuccess: false, message: "Event not found." });
    }

    // Fetch all events for reference
    const AllGlobalEvent = await UserGlobalEvent.find();

    return res.json({
      isSuccess: true,
      message: "Event updated successfully",
      GlobalEvent: event,
      AllGlobalEvent,
    });

  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({
      isSuccess: false,
      message: "Internal server error",
      error: error.message
    });
  }
};



// Delete a User Global Event
exports.deleteUserGlobalEvent = async (req, res) => {
  try {
    const userId = req.user?._id || req.UserSecure_id || req.body.userId;
    const eventId = req.params?.id || req.body?.id || req.query?.id;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        isSuccess: false,
        message: "User ID is required.",
        code: "MISSING_USER_ID"
      });
    }

    if (!eventId) {
      return res.status(400).json({
        isSuccess: false,
        message: "Event ID is required.",
        code: "MISSING_EVENT_ID"
      });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid User ID or Event ID format.",
        code: "INVALID_ID_FORMAT"
      });
    }

    // Check user role/authorization
    const user = await User.findById(userId);
    if (!user || !["admin", "superadmin"].includes(user.userRole)) {
      return res.status(403).json({
        isSuccess: false,
        message: "User not authorized to delete events.",
        code: "UNAUTHORIZED"
      });
    }

    // Check if event exists
    const event = await UserGlobalEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        isSuccess: false,
        message: "Event not found.",
        code: "EVENT_NOT_FOUND"
      });
    }

    // Remove associated image if it exists
    RemoveUserGlobalEventImageById(eventId);

    // Delete event
    const deletedEvent = await UserGlobalEvent.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({
        isSuccess: false,
        message: "Failed to delete event. It may have already been removed.",
        code: "DELETE_FAILED"
      });
    }

    // Fetch updated events
    const globalEvents = await UserGlobalEvent.find({})
      .populate("userIds", "name email avatar")
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JS objects (optional)

    return res.status(200).json({
      isSuccess: true,
      message: "Event deleted successfully.",
      deletedEvent: {
        id: deletedEvent._id,
        name: deletedEvent.eventName
      },
      GlobalEvent: globalEvents,
      count: {
        totalEvents: globalEvents.length,
        remainingEvents: globalEvents.length
      }
    });

  } catch (error) {
    console.error("Error deleting event:", error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        isSuccess: false,
        message: "Invalid ID format.",
        code: "CAST_ERROR",
        error: error.message
      });
    }

    return res.status(500).json({
      isSuccess: false,
      message: "Internal server error",
      code: "INTERNAL_SERVER_ERROR",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
