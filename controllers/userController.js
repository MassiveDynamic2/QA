const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

// GET ALL
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const allUsers = await User.find();
	res.status(200).json({
		status: 'success',
		results: allUsers.length,
		data: {
			allUsers,
		},
	});
});

// GET ONE
exports.getOneUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);

	if (!user) {
		return next(new AppError('No user found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: {
			data: user,
		},
	});
});

// CREATE ONE
exports.createUser = catchAsync(async (req, res, next) => {
	const newUser = await User.create(req.body);
	res.status(201).json({
		status: 'success',
		data: {
			newUser,
		},
	});
});

// UPDATE ONE
exports.updateUser = catchAsync(async (req, res, next) => {
	const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updateUser) {
		return next(new AppError('No document found with that ID', 404));
	}
	res.status(200).json({
		status: 'success',
		data: { updateUser },
	});
});

// DELETE ALL
exports.deleteAllUser = catchAsync(async (req, res) => {
	await User.deleteMany();
	res.status(204).json({
		status: 'success',
		message: 'Deleted All',
	});
});

// DELETE ONE
exports.deleteOneUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndRemove(req.params.id);

	if (!user) {
		return next(new AppError('No document found with that ID', 404));
	}
	res.status(204).json({
		status: 'success',
		message: 'Deleted',
	});
});
