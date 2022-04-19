const express = require('express');

const {
	getAll,
	createQA,
	deleteAll,
	getOne,
	deleteOne,
	updateOne,
	setId,
	getSingleUserQuestions,
} = require('../controllers/questionAnswerController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.get('/singleUser', getSingleUserQuestions);

router.use(protect);

router.post('/', setId, createQA);

router.patch('/:id', setId, updateOne);

router.delete('/:id', setId, deleteOne);

router.use(restrictTo('admin'));

router.get('/', getAll);

router.delete('/', deleteAll);

router.get('/:id', getOne);

module.exports = router;
