import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        res.status(409).json({
          success: false,
          error: 'An account with this email address already exists.',
        });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        email: email.toLowerCase(),
        name,
        passwordHash,
      });

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password.',
        });
        return;
      }

      const token = jwt.sign(
        { id: user._id.toString(), email: user.email, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn as any }
      );

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user._id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Login failed',
      });
    }
  }

  static async me(req: AuthRequest, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  }
}
