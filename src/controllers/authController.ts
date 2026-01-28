import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';

const SALT_ROUNDS = 10;

const sanitizeUser = (user: any) => {
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

const getAccessExpiresIn = (): jwt.SignOptions['expiresIn'] =>
  (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];

const getRefreshExpiresIn = (): jwt.SignOptions['expiresIn'] =>
  (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

const generateAccessToken = (userId: string) =>
  jwt.sign({ userId }, getAccessSecret(), { expiresIn: getAccessExpiresIn() } as jwt.SignOptions);

const generateRefreshToken = (userId: string) =>
  jwt.sign(
    { userId },
    getRefreshSecret(),
    { expiresIn: getRefreshExpiresIn(), jwtid: randomUUID() } as jwt.SignOptions
  );

// POST /auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ message: 'username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, passwordHash });

    const refreshTokenValue = generateRefreshToken(user._id.toString());
    user.refreshTokens.push(refreshTokenValue);
    await user.save();
    await RefreshToken.create({ userId: user._id, token: refreshTokenValue });

    const accessToken = generateAccessToken(user._id.toString());
    return res.status(201).json({ user: sanitizeUser(user), accessToken, refreshToken: refreshTokenValue });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const refreshTokenValue = generateRefreshToken(user._id.toString());
    user.refreshTokens.push(refreshTokenValue);
    await user.save();
    await RefreshToken.create({ userId: user._id, token: refreshTokenValue });

    const accessToken = generateAccessToken(user._id.toString());
    return res.json({ user: sanitizeUser(user), accessToken, refreshToken: refreshTokenValue });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// POST /auth/refresh
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'token is required' });
    }

    let payload: any;
    try {
      payload = jwt.verify(token, getRefreshSecret());
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const stored = await RefreshToken.findOne({ token });
    if (!stored) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id.toString());
    return res.json({ accessToken });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// POST /auth/logout
export const logout = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'token is required' });
    }

    await RefreshToken.deleteOne({ token });
    const user = await User.findOne({ refreshTokens: token });
    if (user) {
      user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
      await user.save();
    }
    return res.json({ message: 'Logged out' });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};
