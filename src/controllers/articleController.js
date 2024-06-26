// controllers/articleController.js
const { default: slugify } = require('slugify');
const Article = require('../models/Article');
const User = require('../models/User');

exports.createArticle = async (req, res) => {
  try {
    const { title, description, body, tagList } = req.body;
    
    if (!title) {
      return res.status(400).json({ errors: { title: "can't be blank" } });
    }
    
    if (!description) {
      return res.status(400).json({ errors: { description: "can't be blank" } });
    }
    
    if (!body) {
      return res.status(400).json({ errors: { body: "can't be blank" } });
    }

    const article = new Article({
      title,
      description,
      body,
      tagList: tagList || [],
      author: req.user._id  // Assuming req.user is set by auth middleware
    });
    
    await article.save();
    
    // Populate author details
    await article.populate('author', 'username bio image');

    // Format the response
    const articleResponse = article.toArticleResponse(req.user);

    res.status(201).json({ article: articleResponse });
  } catch (error) {
    console.error('Error in createArticle:', error);
    res.status(500).json({ errors: { body: ['Could not create article', error.message] } });
  }
};


exports.updateArticle= async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['title', 'description', 'body'];
  const isValidUpdate = updates.every(update => allowedUpdates.includes(update));
  const querySlug = req.params.slug;


  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid Update" });
  }

  try {
    if (req.body.title) {
      slug = slugify(req.body.title, { lower: true, strict: true });
      req.body.slug = slug;
    }

    const article = await Article.findOneAndUpdate({slug: querySlug}, req.body, {new: true, runValidators: true});

    if (!article) {
      return res.status(404).send({ error: 'Article not found' });
    }
    
    await article.populate('author', "username bio image")
    const articleResponse = article.toArticleResponse(req.user);

    res.status(200).send({ article: articleResponse})

  } catch (error) {
    return res.status(400).send({ error: "Internal Server error" });
  }

};

exports.getArticle = async (req, res) => {
  const slug = req.params.slug;
  try {
    const article = await Article.findOne({ slug: req.params.slug});
    if(!article) {
      return res.status(404).send({ error: 'Article not found' });
    }

    await article.populate('author', "username bio image")
    const articleResponse = article.toArticleResponse(req.user);

    res.status(200).send({ article: articleResponse});
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Internal Server error" });
  }
}

exports.favoriteArticle = async (req, res) => { 

  const slug =  req.params.slug;

  try {

    const article = await Article.findOne({ slug: slug });
    reqUser = req.user;

    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    if (reqUser.favoritesList.includes(article._id)){
      return res.status(400).send({ error: "you already favorited this Article" });
    }

    reqUser.favoritesList.push(article._id);
    article.favoritesCount += 1;

    await reqUser.save();
    await article.save();

    await article.populate('author', "username bio image");
    const articleResponse = article.toArticleResponse(reqUser);

    res.status(200).send({ article: articleResponse });

  } catch (error) {

    console.log(error);
    return res.status(400).send({ error: "Internal Server error" });

  }
}

exports.UnfavoriteArticle = async (req, res) => { 

  const slug =  req.params.slug;
  reqUser = req.user;

  try {

    const article = await Article.findOne({ slug: slug });

    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    if (!reqUser.favoritesList.includes(article._id)){
      return res.status(400).send({ error: "you are not favorited this Article" });
    }

    reqUser.favoritesList = reqUser.favoritesList.filter(id => !id.equals(article._id));

    article.favoritesCount -= 1;

    await reqUser.save();
    await article.save();

    await article.populate('author', "username bio image");
    const articleResponse = article.toArticleResponse(reqUser);

    res.status(200).send({ article: articleResponse });

  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: "Internal Server error" });
  }
};


exports.listArticles = async (req, res) => {
  try{
    const { tag, author, favorited, limit = 20, offset = 0 } =  req.query;
    const query = {};

    if (tag){
      query.tagList = tag;
    }
    if (author){
      console.log(author);
      const user = await User.findOne({ username: author });
      query.author = user ? user._id : null;
    }

    if (favorited){
      const user = await User.findOne({ username: favorited });
      if (user){
        query._id = { $in: user.favoritesList };
      }
    }

    const articlePromsie = Article.find(query)
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: 'desc'})
      .populate('author', "username bio image");

    const countPromise = Article.countDocuments(query);

    const [ articles, articlesCount ] = await Promise.all([articlePromsie, countPromise]);

    const articleResponse = articles.map(article => article.toArticleResponse(req.user));

    res.status(200).send({ articles: articleResponse, articlesCount});
  }catch(error){
    console.log(error);
    return res.status(400).send({ error: ["Internal Server error", error.message] });
  }
};

exports.feedArticles = async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const user = await User.findById(req.user._id);

    const articlePromsie = Article.find({ author: { $in: user.followingList } })
      .limit(Number(limit))
      .skip(Number(offset))
      .sort({ createdAt: 'desc' })
      .populate('author', "username bio image");

    const countPromise = Article.countDocuments({ author: { $in: user.followingList }});
    const [articles, articlesCount] = await Promise.all([ articlePromsie, countPromise]);
    const articleResponse = articles.map(article => article.toArticleResponse(user));

    res.status(200).send({ articles: articleResponse, articlesCount})
  } catch (error) {
    console.log(error);
    return res.status(400).send({ error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const slug = req.params.slug;
    const article = await Article.findOne({slug: slug});

    if (!article) {
      return res.status(404).send({ error: "Article not found" });
    }

    if (article.author.toString() !== req.user.id){
      return res.status(400).send({error: "This is not your Article, you don't have to delete this..!"});
    }

    await Article.findOneAndDelete({slug: slug});

    res.status(200).send({message: `Article ${slug} deleted successfully`})
  } catch (error) {
    console.log(error);
    return res.status(400).send({error: error});
  }
};


exports.getTags = async (req, res) => {
  try {
    // Aggregate to get unique tags
    const tags = await Article.aggregate([
      // Unwind the tagList array
      { $unwind: "$tagList" },
      // Group by tags and get unique ones
      { $group: { _id: "$tagList" } },
      // Sort alphabetically
      { $sort: { _id: 1 } },
      // Project to reshape the output
      { $project: { _id: 0, tag: "$_id" } }
    ]);

    // Extract tags from the result
    const tagList = tags.map(t => t.tag);

    res.json({ tags: tagList });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};