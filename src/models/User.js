const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Article = require('../models/Article')

const userSchema = new mongoose.Schema({
    token: {type: String, required: false},
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    bio: {type: String, required: false, default: "Hai Hell....!"},
    image: {type: String, required: false, default: null},
    followingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    followersList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    favoritesList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Article'}],
});

userSchema.methods.toJSON = function(){
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  delete userObj.__v;
  delete userObj._id;
  delete userObj.followingList;
  delete userObj.followersList;
  delete userObj.favoritesList;

  return userObj
};

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);