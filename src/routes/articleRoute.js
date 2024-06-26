const express = require('express');
const { createArticle, updateArticle } = require('../controllers/articleController');
const auth = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/', auth, createArticle);
router.get('/:slug', updateArticle);
router.put('/:slug', auth, updateArticle);

module.exports = router;