import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/skills?function_area=...
router.get('/', async (req, res) => {
  try {
    const { function_area } = req.query;
    const params = [];
    let sql = `
      SELECT function_area, specialization, skill_name, employee_id
      FROM skills
    `;
    if (function_area) {
      sql += ' WHERE function_area = $1';
      params.push(function_area);
    }
    sql += ' ORDER BY function_area, specialization, skill_name, employee_id';

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

export default router;
