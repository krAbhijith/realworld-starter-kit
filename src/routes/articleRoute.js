const express = require('express');
const { createArticle, updateArticle, favoriteArticle, UnfavoriteArticle, listArticles, getArticle, feedArticles, deleteArticle } = require('../controllers/articleController');
const auth = require('../middleware/authMiddleware')
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const { createComment, deleteComment, getComment } = require('../controllers/commentController');
const router = express.Router();

router.post('/', auth, createArticle);
router.get('/', optionalAuth, listArticles);
router.get('/feed', auth, feedArticles);
router.get('/:slug', optionalAuth, getArticle);
router.put('/:slug', auth, updateArticle);
router.delete('/:slug', auth, deleteArticle);
router.post('/:slug/favorite', auth, favoriteArticle);
router.delete('/:slug/favorite', auth, UnfavoriteArticle);


// Routes for Comments

router.get('/:slug/comments', optionalAuth, getComment);
router.post('/:slug/comments', optionalAuth, createComment);
router.delete('/:slug/comments/:id', auth, deleteComment);

module.exports = router;