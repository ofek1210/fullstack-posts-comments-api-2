"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refreshToken = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const SALT_ROUNDS = 10;
const sanitizeUser = (user) => {
    const plain = user.toObject ? user.toObject() : user;
    return {
        _id: plain._id,
        username: plain.username,
        email: plain.email
    };
};
const getAccessSecret = () => {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
        throw new Error('JWT_ACCESS_SECRET is not configured');
    }
    return secret;
};
const getRefreshSecret = () => {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret) {
        throw new Error('JWT_REFRESH_SECRET is not configured');
    }
    return secret;
};
const getAccessExpiresIn = () => (process.env.JWT_ACCESS_EXPIRES_IN || '15m');
const getRefreshExpiresIn = () => (process.env.JWT_REFRESH_EXPIRES_IN || '7d');
const generateAccessToken = (userId) => jsonwebtoken_1.default.sign({ userId }, getAccessSecret(), { expiresIn: getAccessExpiresIn() });
const generateRefreshToken = (userId) => jsonwebtoken_1.default.sign({ userId }, getRefreshSecret(), { expiresIn: getRefreshExpiresIn(), jwtid: (0, crypto_1.randomUUID)() });
// POST /auth/register
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: 'username, email and password are required' });
        }
        const existing = await User_1.default.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(409).json({ message: 'username or email already exists' });
        }
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        const user = await User_1.default.create({ username, email, passwordHash });
        const refreshTokenValue = generateRefreshToken(user._id.toString());
        user.refreshTokens.push(refreshTokenValue);
        await user.save();
        await RefreshToken_1.default.create({ userId: user._id, token: refreshTokenValue });
        const accessToken = generateAccessToken(user._id.toString());
        return res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken: refreshTokenValue });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.register = register;
// POST /auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'email and password are required' });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const refreshTokenValue = generateRefreshToken(user._id.toString());
        user.refreshTokens.push(refreshTokenValue);
        await user.save();
        await RefreshToken_1.default.create({ userId: user._id, token: refreshTokenValue });
        const accessToken = generateAccessToken(user._id.toString());
        return res.json({ user: sanitizeUser(user), accessToken, refreshToken: refreshTokenValue });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.login = login;
// POST /auth/refresh
const refreshToken = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'token is required' });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, getRefreshSecret());
        }
        catch {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const stored = await RefreshToken_1.default.findOne({ token });
        if (!stored) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const user = await User_1.default.findById(payload.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const accessToken = generateAccessToken(user._id.toString());
        return res.json({ accessToken });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.refreshToken = refreshToken;
// POST /auth/logout
const logout = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ message: 'token is required' });
        }
        await RefreshToken_1.default.deleteOne({ token });
        const user = await User_1.default.findOne({ refreshTokens: token });
        if (user) {
            user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
            await user.save();
        }
        return res.json({ message: 'Logged out' });
    }
    catch (err) {
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(500).json({ message: 'An unknown error occurred' });
    }
};
exports.logout = logout;
