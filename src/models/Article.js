const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  tagList: [{
    type: String
  }],
  favorited: {
    type: Boolean,
    default: false
  },
  favoritesCount: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Pre-save hook to generate slug
articleSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Virtual for author's details
articleSchema.virtual('authorDetails', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true
});

// Method to format the article response
articleSchema.methods.toArticleResponse = function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    body: this.body,
    tagList: this.tagList,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    favorited: user ? user.favoritesList.includes(this._id) : false,
    favoritesCount: this.favoritesCount,
    author: this.author ? {
      username: this.author.username,
      bio: this.author.bio,
      image: this.author.image,
      following: user ? user.followingList.includes(this.author._id) : false
    } : null
  };
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;