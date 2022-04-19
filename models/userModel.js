const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: 'String',
		required: [true, 'A user must have a name'],
	},
	email: {
		type: String,
		required: [true, 'Email address is required'],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, 'Please provide a valid eMail'],
		trim: true,
	},
	photo: { type: String },
	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 8,
		select: false,
	},
	passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date,
});

// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);

	return next();
});

// eslint-disable-next-line operator-linebreak
userSchema.methods.correctPassword =
async (candidatePassword, userPassword) => bcrypt.compare(candidatePassword, userPassword);

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
	if (this.passwordChangedAt) {
		const changedTimeStamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10,
		);
		return JWTTimestamp < changedTimeStamp;
	}

	return false;
};

// eslint-disable-next-line func-names
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.passwordResetExpires = Date.now() + 100 * 60 * 1000;

	return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
