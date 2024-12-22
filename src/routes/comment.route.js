import express from 'express';
import Comment from '../model/comment.model.js';

const router = express.Router();

router.post('/postComment', async (req, res) => {
    try {
        const newComment = new Comment(req.body);
        await newComment.save();
        res.status(201).send({ message: 'Comment created successfully', comment: newComment });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

//   get all comments
router.get('/totalComments', async (req, res) => {
    try {
        const totalcomments = await Comment.countDocuments({});
        res.status(200).json({ message: 'Total comments retrieved successfully', totalcomments: totalcomments });
    } catch (error) {
        console.log("an error occured while retrieving comments count", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});





export default router;