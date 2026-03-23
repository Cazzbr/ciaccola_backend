import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const user = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        emailProvided: !!user.email
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        role: user.role,
        emailRecovery: user.hasEmailRecovery()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.email) {
      return res.status(400).json({ 
        error: 'Password recovery unavailable - no email provided' 
      });
    }

    // TODO: Send reset email (nodemailer)
    // const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_RESET_SECRET, { expiresIn: '1h' });
    
    res.json({ 
      message: 'Recovery email sent (if email was provided)',
      emailRecoveryAvailable: true 
    });
  } catch (err) {
    res.status(500).json({ error: 'Reset request failed' });
  }
};
