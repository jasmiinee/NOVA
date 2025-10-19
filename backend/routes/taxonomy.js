import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/taxonomy/function-areas
router.get('/function-areas', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT DISTINCT function_area
      FROM skills_taxonomy
      WHERE function_area IS NOT NULL AND TRIM(function_area) <> ''
      ORDER BY function_area
    `);
    res.json(rows.map(r => r.function_area));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch function areas' });
  }
});

export default router;
