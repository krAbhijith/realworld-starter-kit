const express = require('express');
const { getUser, updateUser, showProfile, follow, unfollow } = require('../controllers/userController');
const auth = require('../middleware/authMiddleware')
const router = express.Router();

router.get('/user', auth, getUser);
router.put('/user', auth, updateUser);
router.get('/profiles/:username', showProfile)
router.post('/profiles/:username/follow', auth, follow)
router.delete('/profiles/:username/follow', auth, unfollow)

module.exports = router;