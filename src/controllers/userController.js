const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { default: mongoose } = require('mongoose');

exports.getUser = async (req, res) => {
  try {
    res.status(200).send({ user: req.user});
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.updateUser = async (req, res) => {
  const updates =  Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'bio', 'image'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));

  if (!isValidUpdate){
    return res.status(400).send({ error: "Invalid update" })
  }

  try{
    if (req.body.password){
        req.body.password = await bcrypt.hash(req.body.password, 8);

        const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true, runValidators: true });

        if (!user){
            return res.status(400).send({ error: "User not found" });
        }

        res.send({ user })
    }
  }catch(err) {
    console.error("Error in update:", err);
    res.status(500).send({ error: 'internal server error' });
  }
};

exports.showProfile =  async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username });

        if (!user){
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send({ profile: {user} });
    }catch (error) {
        console.log("Error in showProfile", error);
        res.status(500).send({ error: 'internal server error' });
    }
};


exports.follow = async (req, res) => {
    try {
      const usernameToFollow = req.params.username;
      const follower = req.user;
      const userToFollow = await User.findOne({username: usernameToFollow}); 

      following= follower.followingList.includes(userToFollow._id )

      if(!userToFollow){
        return res.status(400).send({ error: "User not found" });
      }

      if (follower === usernameToFollow){
        return res.status(400).send({ error: "You canot follow yourself" });
      }

      profile = {
        "username": userToFollow.username,
        "bio": userToFollow.bio,
        "image": userToFollow.image,
        "following": !following,
      }

      if (following){
        return res.status(200).send({ error: `You already following ${ userToFollow.username }` }); 
      }

      follower.followingList.push(userToFollow.id);
        await follower.save();

      userToFollow.followersList.push(follower.id);
        await userToFollow.save();

      res.status(200).send({ profile: profile });

    } catch (error) {
        console.log(error);
    }
};



exports.unfollow = async (req, res) => {
    try {
        const usernameToUnfollow = req.params.username;
        const follower = req.user;
        const userToUnfollow = await User.findOne({username: usernameToUnfollow}); 

        following= follower.followingList.includes(userToUnfollow._id )

        if(!userToUnfollow){
            return res.status(400).send({ error: "User not found" });
        }

        if (follower === usernameToUnfollow){
            return res.status(400).send({ error: "You canot follow yourself" });
        }
          
        if (!following){
          return res.status(400).send({ error: `you are not following ${userToUnfollow.username} to unfollow` });
        }

        profile = {
            "username": userToUnfollow.username,
            "bio": userToUnfollow.bio,
            "image": userToUnfollow.image,
            "following": !following,
        }

        follower.followingList = follower.followingList.filter(id => !id.equals(userToUnfollow._id));
        userToUnfollow.followersList = userToUnfollow.followersList.filter(id => !id.equals(follower._id));

        await follower.save();
        await userToUnfollow.save();
        
        res.status(200).send({ profile: profile });

    } catch (error) {
        console.log(error);
    }
};