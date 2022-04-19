const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.mailtrap.io',
		port: 2525,
		auth: {
			user: process.env.NODE_MAILER_USER,
			pass: process.env.NODE_MAILER_PASSWORD,
		},
	});
	const mailOptions = {
		from: `Omer Husni ${process.env.FROM}`, // sender address
		to: options.to,
		subject: options.subject, // Subject line
		text: options.text, // plain text body
		// html: '<b>Hello world?</b>', // html body
	};

	await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
