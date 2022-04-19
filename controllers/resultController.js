/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
const _ = require('lodash');

const catchAsync = require('../utils/catchAsync');
const Result = require('../models/resultModel');
const QA = require('../models/questionAnswerModel');
const AppError = require('../utils/appError');

exports.create = catchAsync(async (req, res, next) => {
	const guest = await Result.create({
		name: req.body.name,
		answers: req.body.answers,
		result: req.body.result,
		userId: req.body.userId,
	});
	if (!guest) {
		return next(new AppError('Please provide a name and answers', 401));
	}
	return next();
});
exports.validateAnswers = catchAsync(async (req, res, next) => {
	const { answers } = req.body;
	const questionIds = _.map(answers, 'questionId');
	const Q_A = await QA.find({ _id: { $in: questionIds } });
	if (Q_A.length === 0) { return next(new AppError('There is no question with that id'), 400); }

	const results = [];

	_.forEach(answers, (eachAnswer) => {
		// eslint-disable-next-line no-underscore-dangle
		const foundedQuestion = _.find(Q_A, (question) => question._id === eachAnswer.questionId);
		if (foundedQuestion && foundedQuestion.correctAnswer === eachAnswer.answer) {
			results.push({ questionId: eachAnswer.questionId, isCorrect: true });
		} else {
			results.push({ questionId: eachAnswer.questionId, isCorrect: false });
		}
	});
	res.status(200).json({ results });
});

exports.getAll = catchAsync(async (req, res, next) => {
	const allResults = await Result.find();

	res.status(200).json({ allResults });
});

exports.deleteAll = catchAsync(async (req, res, next) => {
	await Result.deleteMany();
	res.status(204).json({
		status: 'success',
		message: 'Deleted All',
	});
});
