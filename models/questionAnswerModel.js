/* eslint-disable func-names */
/* eslint-disable no-mixed-spaces-and-tabs */
const mongoose = require('mongoose');

const qaSchema = mongoose.Schema(
	{
		question: {
			type: String,
			required: [true, 'Please enter a question'],
			trim: true,
		},
		questionOptions: {
			type: [String],
			required: [true, 'Please enter answers'],
		// only input four option
		},
		correctAnswer: {
			type: String,
			required: [true, 'Please enter the correct answer'],
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: [true, 'Review must belong to a user'],
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
);

qaSchema.pre(/^find/, function (next) {
	this.populate({
		path: 'user',
		select: 'name',
	  });
	  next();
});

const QA = mongoose.model('QA', qaSchema);

module.exports = QA;
