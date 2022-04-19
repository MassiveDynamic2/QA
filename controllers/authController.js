/* eslint-disable no-trailing-spaces */
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, {
	expiresIn: process.env.JWT_EXPIRES_IN,
});

const createSendToken = (user, statusCode, res) => {
	// eslint-disable-next-line no-underscore-dangle
	const token = signToken(user._id);

	const cookieOptions = {
		expiresIn: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
	res.cookie('jwt', token, cookieOptions);

	// eslint-disable-next-line no-param-reassign
	user.password = undefined;
	res.status(statusCode).json({
		status: 'success',
		token,
		data: user,
	});
};

exports.signup = catchAsync(async (req, res) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		photo: req.body.photo,
		role: req.body.role,
		password: req.body.password,
	});
	createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
	const { email } = req.body;

	const { password } = req.body;

	if (!password || !email) { return next(new AppError('Please enter name and email', 401)); }

	const user = await User.findOne({ email }).select('+password');

	if (!user || !(await user.correctPassword(password, user.password))) { return next(new AppError('Incorrect email or password', 401)); }

	return	createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
	res.cookie('jwt', 'logged out', {
		expires: new Date(Date.now() + 10 * 1000),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success', message: 'logged out' });
};

exports.protect = catchAsync(async (req, res, next) => {
	let token;
	if (
		req.headers.authorization
    && req.headers.authorization.startsWith('Bearer')
	) {
		// eslint-disable-next-line prefer-destructuring
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return next(
			new AppError('You are not logged in please login to get access.', 401),
		);
	}

	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	const currentUser = await User.findById(decoded.id);

	if (!currentUser) {
		return next(
			new AppError('The user that belongs to this id does not exist.', 401),
		);
	}

	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError(
				'The user recently changed their password. Please login again.',
				401,
			),
		);
	}
	req.user = currentUser;
	res.locals.user = currentUser;
	return 	next();
});

exports.restrictTo = (...roles) => catchAsync(async (req, res, next) => {
	if (!roles.includes(req.user.role)) {
		return next(
			new AppError('you are not authorized to access this route.', 401),
		);
	}
	return next();
});

exports.forgetPassword = catchAsync(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) return next(new AppError('There is no user with that email address', 404));

	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
	const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

	try {
		await sendEmail({
			to: 'omerhusni637@gmail.com',
			subject: 'Your password resetToken, available only for (10 minutes)',
			text: message,
		});

		res.status(200).json({ status: 'success', message: 'token sent' });
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new AppError('There was an error sending the email. Try again later!'), 500);
	}
	return next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: ({ $gt: Date.now() }),
	});

	if (!user) return next(new AppError('Token is invalid or expires', 400));
	user.password = req.body.password;
	await user.save();

	return createSendToken(user, 200, res);
});

exports.updateMyPassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.user.id).select('+password');
	if (!(await user.correctPassword(req.body.currentPassword, user.password))) 
	// eslint-disable-next-line brace-style
	{ return next(new AppError('Incorrect password'), 401); }

	user.password = req.body.password;
	await user.save();
	return createSendToken(user, 200, res);
});
