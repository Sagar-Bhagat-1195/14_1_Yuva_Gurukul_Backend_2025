const express = require("express");
const router = express.Router();
const UserGlobalEvent = require("./UserGlobalEvent.controller");
const UserSecure = require("../user/user.secure");

// Protect all routes with UserSecure middleware
router.post("/", UserSecure, UserGlobalEvent.createUserGlobalEvent);
router.get("/:id?", UserSecure, UserGlobalEvent.getAllUserGlobalEvent);
router.put("/:id?", UserSecure, UserGlobalEvent.updateUserGlobalEvent);
router.delete("/:id?", UserSecure, UserGlobalEvent.deleteUserGlobalEvent);

module.exports = router;
