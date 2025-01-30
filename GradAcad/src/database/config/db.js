import { MongoClient } from 'mongodb';

const mongoURL = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'gradacad';

let db;

export const connectDB = async () => {
    try {
        const client = new MongoClient(mongoURL);
        await client.connect();
        console.log('Connected to MongoDB');
        db = client.db(dbName);
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1); 
    }
};

export const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return db;
};
