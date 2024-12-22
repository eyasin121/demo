import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import blogRouter from './src/routes/blog.route.js';
import commentRouter from './src/routes/comment.route.js';
import userRouter from './src/routes/user.route.js';

dotenv.config();

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// app.use(cors({
//   origin: ['https://gleeful-fairy-567193.netlify.app/', 'gleeful-fairy-567193.netlify.app/:1'], 
//   credentials: true
// }));

 app.use((req, res, next) => {
       res.header('Access-Control-Allow-Origin', 'https://btc-q3zg.onrender.com'); // Replace with your Netlify domain
       res.header('Access-Control-Allow-Credentials', 'true');
       res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow the necessary HTTP methods
       res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Allow necessary headers
       next();
     });


app.use('/api/blog', blogRouter);
app.use('/api/comment', commentRouter);
app.use('/api/user', userRouter);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("DB connected successfully");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (err) {
    console.error('Failed to connect to the database', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
  });
}

main();
