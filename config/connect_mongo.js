import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB is connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // rethrow the error to handle it in the index.js
  }
};

export default connectToMongoDB;
