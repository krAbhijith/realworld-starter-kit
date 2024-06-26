const { default: mongoose } = require("mongoose");
const Article = require("./Article");

const commentSchema = new mongoose.Schema({
    body: {
        type: String,
        required: true
    },
    author: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    article: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Article',
        required: true
    }
}, { timestamps: true });

commentSchema.methods.toCommentResponse = function (user) {
    return {
        id: this._id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        body: this.body,
        author: this.author ? {
            username: this.author.username,
            bio: this.author.bio,
            image: this.author.image,
            following: user ? user.followingList.includes(this.author._id) : false

        } : null
    };
};

module.exports = mongoose.model('Comment', commentSchema);
