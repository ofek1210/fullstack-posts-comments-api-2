import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';

const SALT_ROUNDS = 10;

const sanitizeUser = (user: any) => {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.passwordHash;
  return plain;
};

// POST /users
export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({ username, email, passwordHash });
    return res.status(201).json(sanitizeUser(user));
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (err) {
    if (err instanceof Error) {
        return res.status(500).json({ message: err.message });
    }
    return res.status(500).json({ message: 'An unknown error occurred' });
  }
};

// GET /users/:id
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(sanitizeUser(user));
  } catch {
    return res.status(400).json({ message: 'Invalid user id' });
  }
};

// PUT /users/:id
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email) {
      return res.status(400).json({ message: 'username and email are required' });
    }

    const updateData: Record<string, unknown> = { username, email };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: 'User not found' });
    return res.json(sanitizeUser(updated));
  } catch {
    return res.status(400).json({ message: 'Invalid user id' });
  }
};

// DELETE /users/:id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    return res.json({ message: 'User deleted' });
  } catch {
    return res.status(400).json({ message: 'Invalid user id' });
  }
};
