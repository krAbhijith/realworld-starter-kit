const express = require('express');
const { createArticle, updateArticle, favoriteArticle, UnfavoriteArticle, listArticles, getArticle, feedArticles, deleteArticle } = require('../controllers/articleController');
const auth = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware')
const router = express.Router();

router.post('/', auth, createArticle);
router.get('/', optionalAuth, listArticles);
router.get('/feed', auth, feedArticles);
router.get('/:slug', optionalAuth, getArticle);
router.put('/:slug', auth, updateArticle);
router.delete('/:slug', auth, deleteArticle);
router.post('/:slug/favorite', auth, favoriteArticle);
router.delete('/:slug/favorite', auth, UnfavoriteArticle);

module.exports = router;