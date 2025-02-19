const express = require('express');
const { usersController } = require('../controllers');

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.post('/create', usersController.createUser);
router.post('/login', usersController.loginUser);

module.exports = router;
