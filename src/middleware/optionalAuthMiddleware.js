const jwt = require('jsonwebtoken');
const User = require('../models/User');

const optionalAuth = async (req, res, next) => {
  try {
    const headerToken = req.header('Authorization');
    if (headerToken) {
      const token = req.header('Authorization').replace('Bearer ', '');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).send({ error: error.message });
  }
};

module.exports = optionalAuth;