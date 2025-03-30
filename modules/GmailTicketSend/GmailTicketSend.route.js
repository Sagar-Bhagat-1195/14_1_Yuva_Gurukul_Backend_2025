const express = require('express');
const router = express.Router();
const GmailTicketSend = require('./GmailTicketSend.controller');

router.post('/:gmail?', GmailTicketSend.GmailTicketSend);


module.exports = router;
