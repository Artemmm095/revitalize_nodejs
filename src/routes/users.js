const express = require('express');
const { usersController } = require('../controllers');
const { auth } = require('../middleware/auth');
const { checkUserExistence } = require('../middleware/checkUserExistence');

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.post('/create', usersController.createUser);
router.post('/login', usersController.loginUser);
router.patch('/:userId/editProfile', auth, checkUserExistence, usersController.editProfile);
router.patch('/:userId/updatePassword', auth, checkUserExistence, usersController.updatePassword);
router.patch('/:userId/updateAvatar', auth, checkUserExistence, usersController.updateAvatar);

module.exports = router;
