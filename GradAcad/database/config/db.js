import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const mongoURL = process.env.MONGODB_ATLAS_URI;
const localDbName = 'GradAcadv2';
const cloudDbName = 'GradAcad';

let client;
let db;

export const connectDB = async () => {
    try {
        client = new MongoClient(mongoURL, {
            maxPoolSize: 50,
            socketTimeoutMS: 30000,
        });
        await client.connect();
        db = client.db(cloudDbName);
        console.log('📦 Connected to MongoDB');
    } catch (err) {
        console.error('❌ DB connection error:', err);
        throw err;
    }
};

export const getDB = () => {
    if (!db) throw new Error('Database not initialized');
    return db;
};

export const closeDB = async () => {
    if (client) await client.close();
};

export const JWT_SECRET = process.env.JWT_SECRET;