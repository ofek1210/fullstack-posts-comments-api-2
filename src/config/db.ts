import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/posts-comments-db';
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    if (error instanceof Error) {
      console.error('MongoDB connection failed', error.message);
    } else {
      console.error('An unknown error occurred during MongoDB connection');
    }
    process.exit(1);
  }
};

export default connectDB;
