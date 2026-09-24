import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino({ name: 'database' });

export async function connectDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/swaraj_digital';

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 50,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info('Connected to MongoDB Cluster successfully.');
    return conn;
  } catch (error) {
    logger.warn(`MongoDB initial connection warning: ${(error as Error).message}. Operating in resilient mode.`);
    return mongoose;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB.');
}
