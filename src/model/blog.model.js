import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String, 
  content:{
    type: Object,
    required: true,
  },
  coverImg:String,
  category:String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
 
});


const Blog = mongoose.model('Blog', blogSchema);

export default Blog;