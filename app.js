const express = require('express');
const morgan = require('morgan');
const xss = require('xss-clean');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const QARoutes = require('./routes/questionAnswerRoutes');
const userRoutes = require('./routes/userRoutes');
const resultRoute = require('./routes/resultRoute');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

// MIDDLEWARE

app.use(helmet());

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP! Try again in an hour.',
});

app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));

// limit req from same IP
app.use(mongoSanitize());

app.use(xss());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(compression());

// ROUTES
app.use('/api/v1/QA', QARoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/result', resultRoute);

// TO HANDLE ALL UNDEFINED ROUTS
app.all('*', (req, res, next) => {
  next(new AppError(`this route is not supported ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
