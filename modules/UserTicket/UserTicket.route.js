const express = require("express");
const router = express.Router();
const UserTicketController = require("./UserTicket.controller");
const UserSecure = require("../user/user.secure");

// Protect all routes with UserSecure middleware
router.post("/", UserSecure, UserTicketController.createUserTicket);
router.put("/", UserSecure, UserTicketController.confirmUserTicket);
router.get("/:GlobalEventId?/:GetEventAllTicket?", UserSecure, UserTicketController.getAllUserEventsById);
// router.put("/:id?", UserSecure, UserEventController.updateUserEvent);
// router.delete("/:id?", UserSecure, UserEventController.deleteUserEvent);

module.exports = router;


