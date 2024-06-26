const Article = require("../models/Article");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.createComment = async (req, res) => {
    try {
        const comment = new Comment(req.body.comment);
        comment.author = req.user._id;

        articleCommented = await Article.findOne({ slug: req.params.slug });
        comment.article = articleCommented._id;

        await comment.save();

        await comment.populate('author', "username bio image")
        const commentResponse = comment.toCommentResponse(req.user);

        res.status(200).send({comment: commentResponse});
    } catch (error) {
        res.status(400).send({error: error.message})
    }
};

exports.getComment = async (req, res) => {
    try {
        const slug = req.params.slug;
        const article = await Article.findOne({slug: slug});

        if (!article) {
            return res.status(404).send({error: "Article not found"})
        }

        const comments = await Comment.find({article: article._id}).populate('author', "username bio image")
        const commentResponse = comments.map(comment => comment.toCommentResponse(req.user));

        res.status(200).send({ comments: commentResponse});
    } catch (error) {
        console.log(error);
    }

};


exports.deleteComment = async (req, res) => {
    try {
        const {slug, id} = req.params;

        const comment = await Comment.findOne({_id: id});
    
        if (!comment) {
          return res.status(404).send({ error: "comment not found" });
        }
    
        if (comment.author.toString() !== req.user.id){
          return res.status(400).send({error: "This is not your comment, you don't have to delete this..!"});
        }
    
        await Comment.findOneAndDelete({_id: id});
    
        res.status(200).send({message: `comment ${slug} deleted successfully`})
      } catch (error) {
        console.log(error);
        return res.status(400).send({error: error.message});
      }
};

