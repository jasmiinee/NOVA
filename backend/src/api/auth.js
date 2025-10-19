import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {pool} from '../../db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { email, password, employeeId } = req.body;

    if (!email || !password || !employeeId) {
      return res.status(400).json({ error: 'Email, password, and employeeId are required' });
    }

    // Check if employee exists AND email matches
    const empCheck = await pool.query(
      'SELECT id, email FROM employees WHERE employee_id = $1',
      [employeeId]
    );

    if (empCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Employee ID not found' });
    }

    // Verify email matches the employee record
    const employee = empCheck.rows[0];
    if (employee.email !== email) {
      return res.status(400).json({ error: 'Email does not match employee record' });
    }

    // Check if user already has an account
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE employee_id = $1',
      [employeeId]
    );

    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'User account already exists for this employee' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (employee_id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, employee_id, email',
      [employeeId, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id, employeeId: user.employee_id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      ok: true, 
      token, 
      user: { id: user.id, email: user.email, employeeId: user.employee_id } 
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', details: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, employee_id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, employeeId: user.employee_id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ 
      ok: true, 
      token, 
      user: { id: user.id, email: user.email, employeeId: user.employee_id } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, employee_id, email FROM users WHERE id = $1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ ok: true, user: result.rows[0] });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user', details: err.message });
  }
});

// Logout (frontend just deletes token, but you can invalidate on backend if needed)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ ok: true, message: 'Logged out successfully' });
});

// Middleware to verify JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.userId = decoded.userId;
    req.employeeId = decoded.employeeId;
    next();
  });
}

export default router;