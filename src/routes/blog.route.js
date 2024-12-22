import express from 'express';
import Blog from '../model/blog.model.js';
import Comment from '../model/comment.model.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Create blog
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
    try {
        const newPost = new Blog({ ...req.body });
        await newPost.save();
        res.status(201).send({
            message: "Blog created successfully",
            post: newPost
        });
    } catch (error) {
        console.error("Error in creating blog:", error);
        res.status(500).json({ message: "Error in creating blog" });
    }
});

// Get all blogs
router.get('/', async (req, res) => {
    try {
        const { search, category, location } = req.query;
        let query = {};

        if (search) {
            query = {
                ...query,
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { content: { $regex: search, $options: 'i' } }
                ]
            };
        }

        if (category) {
            query = {
                ...query,
                category
            };
        }

        if (location) {
            query = {
                ...query,
                location
            };
        }

        const posts = await Blog.find(query).populate("author", "email").sort({ createdAt: -1 });
        res.status(200).send(posts);
    } catch (error) {
        console.error("Error in fetching blogs:", error);
        res.status(500).send({ message: "Error in fetching blogs" });
    }
});

// Get single blog by id
router.get('/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Blog.findById(postId);
        if (!post) {
            return res.status(404).send({ message: "Blog not found" });
        }
        const comments = await Comment.find({ postId }).populate('user', "username email");
        res.status(200).send({
            message: "Blog found",
            post,
            comments
        });
    } catch (error) {
        console.error("Error in getting blog:", error);
        res.status(500).send({ message: "Error in getting blog" });
    }
});

// // Update blog by id
// router.put('/:id', verifyToken, async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const post = await Blog.findById(postId);
//         if (!post) {
//             return res.status(404).send({ message: "Blog not found" });
//         }

//         // Ensure only the author or an admin can update the blog
//         if (req.user.id !== post.author.toString() && !req.user.isAdmin) {
//             return res.status(403).send({ message: "Unauthorized" });
//         }

//         const updatedPost = await Blog.findByIdAndUpdate(postId, req.body, { new: true });
//         res.status(200).send({
//             message: "Blog updated",
//             post: updatedPost
//         });
//     } catch (error) {
//         console.error("Error in updating blog:", error);
//         res.status(500).send({ message: "Error in updating blog" });
//     }
// });

router.put('/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const postId = req.params.id;
        // const { title, content, category } = req.body;
        const updatedPost = await Blog.findByIdAndUpdate(postId, { ...req.body }, { new: true });
        
        if (!updatedPost) {
            return res.status(404).send({ message: 'Post not found' });
        }
        
        res.status(200).send({ message: 'Post updated successfully', post: updatedPost });
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send({ message: 'Failed to fetch post' });
    }
})
// Delete blog by id
// router.delete('/:id', async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const post = await Blog.findById(postId);
//         if (!post) {
//             return res.status(404).send({ message: "Blog not found" });
//         }

//         // Ensure only the author or an admin can delete the blog
//         if (req.user.id !== post.author.toString() && !req.user.isAdmin) {
//             return res.status(403).send({ message: "Unauthorized" });
//         }

//         await Blog.findByIdAndDelete(postId);
//         await Comment.deleteMany({ postId });
//         res.status(200).send({
//             message: "Blog deleted",
//             post
//         });
//     } catch (error) {
//         console.error("Error in deleting blog:", error);
//         res.status(500).send({ message: "Error in deleting blog" });
//     }
// });
router.delete('/:id', async (req, res) => {
    try {
        const postId = req.params.id;

        // Find and delete the blog post
        const post = await Blog.findByIdAndDelete(postId);

        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }

        // Delete associated comments
        await Comment.deleteMany({ postId: postId });

        res.status(200).send({ message: 'Post and associated comments deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send({ message: 'Failed to delete post' });
    }
});




// Get related blogs
router.get('/related/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(404).send({ message: "Blog not found" });
        }

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(400).send({ message: "Blog not found" });
        }

        const titleRegex = new RegExp(blog.title.split(' ').join('|'), 'i');
        const relatedQuery = {
            _id: { $ne: id },
            title: { $regex: titleRegex },
        };

        const relatedBlogs = await Blog.find(relatedQuery);
        res.status(200).send(relatedBlogs);
    } catch (error) {
        console.error("Error in getting related blogs:", error);
        res.status(500).send({ message: "Error in getting related blogs" });
    }
});

export default router;