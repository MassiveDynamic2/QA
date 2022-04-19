const express = require('express');
const {
	getAllUsers, getOneUser, createUser, updateUser, deleteAllUser, deleteOneUser,
} = require('../controllers/userController');

const {
	signup, login, logout, protect, restrictTo, forgetPassword, resetPassword, updateMyPassword,
} = require('../controllers/authController');

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.get('/logout', logout);

router.post('/forgetPassword', forgetPassword);

router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updateMyPassword);

router.patch('/:id', updateUser);

router.use(restrictTo('admin'));

router.get('/', getAllUsers);

router.post('/', createUser);

router.delete('/', deleteAllUser);

router.get('/:id', getOneUser);

router.delete('/:id', deleteOneUser);

module.exports = router;
