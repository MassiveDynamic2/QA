/* eslint-disable consistent-return */
/* eslint-disable eqeqeq */
/* eslint-disable no-underscore-dangle */
const catchAsync = require('../utils/catchAsync');
// const factory = require('./handlerFactory');
const QA = require('../models/questionAnswerModel');
const AppError = require('../utils/appError');

module.exports = {
	setId: (req, res, next) => {
		if (!req.body.user) { req.body.user = req.user.id; }
		return next();
	},

	getAll: catchAsync(async (req, res) => {
		const allQA = await QA.find();
		return res.status(200).json({
			status: 'success',
			results: allQA.length,
			data: {
				allQA,
			},
		});
	}),

	getOne: catchAsync(async (req, res, next) => {
		const Q_A = await QA.findById(req.params.id);

		if (!Q_A) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: {
				data: Q_A,
			},
		});
		return next();
	}),

	createQA: catchAsync(async (req, res, next) => {
		const newQA = await QA.create(req.body);
		res.status(201).json({
			status: 'success',
			data: {
				newQA,
			},
		});
		next();
	}),

	// UPDATE ONE
	updateOne: catchAsync(async (req, res, next) => {
		const updatedQA = await QA.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!updatedQA) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: { data: updatedQA },
		});
		return next();
	}),

	// DELETE ALL
	deleteAll: catchAsync(async (req, res, next) => {
		await QA.deleteMany();
		res.status(204).json({
			status: 'success',
			message: 'Deleted All',
		});
		return next();
	}),

	// DELETE ONE
	deleteOne: catchAsync(async (req, res, next) => {
		const Q_A = await QA.findByIdAndRemove(req.params.id);

		if (!Q_A) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(204).json({
			status: 'success',
			message: 'Deleted',
		});
		return next();
	}),

	getSingleUserQuestions: catchAsync(async (req, res, next) => {
		const { userId } = req.query;

		const Q_A = await QA.find({ user: userId }).select({ correctAnswer: 0 });

		if (!Q_A) {
			return next(new AppError('No document found with that ID', 404));
		}
		res.status(200).json({
			status: 'success',
			data: Q_A,
		});
	}),

};
