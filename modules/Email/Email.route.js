const express = require('express');
const router = express.Router();
const emailController = require('./Email.controller');

router.post('/', emailController.sendEmail);
router.get('/', emailController.getEmail);
router.put('/:id', emailController.updateEmail);
router.delete('/:id', emailController.deleteEmail);


module.exports = router;
