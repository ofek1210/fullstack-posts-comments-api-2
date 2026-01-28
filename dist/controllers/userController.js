"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
const SALT_ROUNDS = 10;
const sanitizeUser = (user) => {
    const plain = user.toObject ? user.toObject() : user;
    delete plain.passwordHash;
    return plain;
};
// POST /users
const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email and password are required' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const user = await User_1.default.create({ username, email, passwordHash });
        return res.status(201).json(sanitizeUser(user));
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.createUser = createUser;
// GET /users
const getUsers = async (_req, res) => {
    try {
        const users = await User_1.default.find().sort({ createdAt: -1 });
        return res.json(users.map(sanitizeUser));
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.getUsers = getUsers;
// GET /users/:id
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        return res.json(sanitizeUser(user));
    }
    catch {
        return res.status(400).json({ message: 'Invalid user id' });
    }
};
exports.getUserById = getUserById;
// PUT /users/:id
const updateUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email) {
            return res.status(400).json({ message: 'username and email are required' });
        }
        const updateData = { username, email };
        if (password) {
            updateData.passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        }
        const updated = await User_1.default.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!updated)
            return res.status(404).json({ message: 'User not found' });
        return res.json(sanitizeUser(updated));
    }
    catch {
        return res.status(400).json({ message: 'Invalid user id' });
    }
};
exports.updateUser = updateUser;
// DELETE /users/:id
const deleteUser = async (req, res) => {
    try {
        const deleted = await User_1.default.findByIdAndDelete(req.params.id);
        if (!deleted)
            return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User deleted' });
    }
    catch {
        return res.status(400).json({ message: 'Invalid user id' });
    }
};
exports.deleteUser = deleteUser;
