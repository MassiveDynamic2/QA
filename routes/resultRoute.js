const express = require('express');

const {
	create, validateAnswers, getAll, deleteAll,
} = require('../controllers/resultController');

const router = express.Router();

router.post('/', create);

router.get('/', getAll);

router.post('/validate', validateAnswers);

router.delete('/', deleteAll);
module.exports = router;
