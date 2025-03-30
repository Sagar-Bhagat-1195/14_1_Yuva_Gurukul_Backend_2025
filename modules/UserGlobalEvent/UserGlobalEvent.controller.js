const UserGlobalEvent = require("./UserGlobalEvent.model");
const User = require("../user/user.model");
const mongoose = require("mongoose");

// Create a new User Global Event
exports.createUserGlobalEvent = async (req, res) => {
  try {
    const { eventName, fees, image, description, startDate, endDate, ticketNumber, userId: bodyUserId } = req.body;
    const userId = req.UserSecure_id || bodyUserId; // Prioritize UserSecure_id

    if (!userId) {
      return res.status(400).json({ isSuccess: false, message: "User ID is required." });
    }

    // Validate required fields
    if (!eventName || !fees || !image || !description || !startDate || !endDate || !ticketNumber) {
      return res.status(400).json({ isSuccess: false, message: "All fields are required." });
    }

    // Validate fees and ticket number
    if (isNaN(fees) || fees < 0) return res.status(400).json({ isSuccess: false, message: "Invalid fees amount." });
    if (isNaN(ticketNumber) || ticketNumber <= 0) {
      return res.status(400).json({ isSuccess: false, message: "Invalid ticket number." });
    }

    // Validate date range
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (parsedEndDate < parsedStartDate) {
      return res.status(400).json({ isSuccess: false, message: "End date must be after or equal to start date." });
    }

    // Create a new event
    const GlobalEvent = new UserGlobalEvent({
      eventName,
      fees,
      image,
      description,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      ticketNumber,
      userIds: [userId], // Store as an array
    });

    await GlobalEvent.save();
    res.status(201).json({ isSuccess: true, message: "Event created successfully", GlobalEvent });
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ isSuccess: false, message: "Internal server error", error: error.message });
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

    // Admins see all events, regular users see only enabled events
    const filter = (userRole === "admin" || userRole === "superadmin") ? {} : { isEnabled: true };

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

    if (!userId) {
      return res.status(400).json({ isSuccess: false, message: "User ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ isSuccess: false, message: "Invalid Event ID." });
    }

    const updateFields = {};
    const { eventName, fees, image, description, startDate, endDate, ticketNumber } = req.body;

    if (eventName) updateFields.eventName = eventName;
    if (fees) updateFields.fees = fees;
    if (image) updateFields.image = image;
    if (description) updateFields.description = description;
    if (startDate) updateFields.startDate = new Date(startDate);
    if (endDate) updateFields.endDate = new Date(endDate);
    if (ticketNumber) {
      if (isNaN(ticketNumber) || ticketNumber <= 0) {
        return res.status(400).json({ isSuccess: false, message: "Invalid ticket number." });
      }
      updateFields.ticketNumber = ticketNumber;
    }

    const event = await UserGlobalEvent.findOneAndUpdate(
      { _id: req.params.id, userIds: userId },
      updateFields,
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ isSuccess: false, message: "Event not found or access denied." });
    }

    res.json({ isSuccess: true, message: "Event updated successfully", GlobalEvent: event });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ isSuccess: false, message: "Internal server error", error: error.message });
  }
};

// Delete a User Global Event
exports.deleteUserGlobalEvent = async (req, res) => {
  try {
    const userId = req.UserSecure_id || req.body.userId;

    if (!userId) {
      return res.status(400).json({ isSuccess: false, message: "User ID is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ isSuccess: false, message: "Invalid Event ID." });
    }

    const event = await UserGlobalEvent.findOneAndDelete({ _id: req.params.id, userIds: userId });

    if (!event) {
      return res.status(404).json({ isSuccess: false, message: "Event not found or access denied." });
    }

    // Fetch all remaining events for this user
    const globalEvents = await UserGlobalEvent.find({ userIds: userId }).populate("userIds", "name email");

    res.json({
      isSuccess: true,
      message: "Event deleted successfully",
      deletedEvent: event,
      GlobalEvent: globalEvents, // Return updated list of events
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ isSuccess: false, message: "Internal server error", error: error.message });
  }
};
