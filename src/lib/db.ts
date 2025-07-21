import mongoose from 'mongoose';

async function dbConnect() {
  const MONGODB_URI = process.env.MONGO_URI;

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGO_URI environment variable inside .env or in your hosting provider settings.');
  }

  let cached = (global as any).mongoose;

  if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;