const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
	name: {
		type: 'String',
		required: [true, 'Please enter your name'],
	},
	answers: [
		{ questionId: String, answers: [String] },
	],
	result: 'Number',
	userId: 'String',
});

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
