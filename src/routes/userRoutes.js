const express = require('express');
const { getUser, updateUser, showProfile, follow, unfollow } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');
const optionalAuth = require('../middleware/optionalAuthMiddleware');
const { getTags } = require('../controllers/articleController');
const router = express.Router();

router.get('/user', optionalAuth, getUser);
router.put('/user', auth, updateUser);
router.get('/profiles/:username', optionalAuth, showProfile);
router.post('/profiles/:username/follow', auth, follow);
router.delete('/profiles/:username/follow', auth, unfollow);

router.get('/tags', getTags);

module.exports = router;