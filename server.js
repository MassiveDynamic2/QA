/* eslint-disable no-console */
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION , the app crashed 💥💥💥 ...');
	process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
	'<PASSWORD>',
	process.env.DATABASE_PASSWORD,
);

const server = mongoose
	.connect(DB, {
		useNewUrlParser: true,
	})
	.then(() => console.log('DB connected successfully! ... ✅✅✅'));

const port = process.env.PORT;

app.listen(port, () => {
	console.log(`server start listening to port ${port} ... 🔥🔥🔥`);
});

process.on('unhandledRejection', (err) => {
	console.log(err.name, err.message);
	console.log('UNHANDLED REJECTION , the app crashed 💥💥💥 ...');
	server.close(() => process.exit(1));
});
