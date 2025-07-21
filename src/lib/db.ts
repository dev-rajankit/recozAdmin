import mongoose from 'mongoose';

// A global variable to hold the cached mongoose connection.
// This is important in a serverless environment to prevent creating a new connection on every function invocation.
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If we have a cached connection, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If there's no cached connection promise, create one.
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGO_URI;

    // This is the critical check. It now runs only when a connection is actually attempted.
    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGO_URI environment variable inside .env or in your hosting provider settings.'
      );
    }

    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  // Await the promise and cache the connection.
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, reset the promise so we can try again on the next request.
    cached.promise = null;
    throw e;
  }
  
  return cached.conn;
}

export default dbConnect;
