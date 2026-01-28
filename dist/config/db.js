"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/posts-comments-db';
        await mongoose_1.default.connect(uri);
        console.log('MongoDB connected');
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('MongoDB connection failed', error.message);
        }
        else {
            console.error('An unknown error occurred during MongoDB connection');
        }
        process.exit(1);
    }
};
exports.default = connectDB;
