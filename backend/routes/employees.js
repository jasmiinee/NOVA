import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/employees
router.get('/', async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.employee_id, e.name, e.email, e.job_title, e.department, e.unit
      FROM employees e
      ORDER BY e.name
    `);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// GET /api/employees/:employeeId
router.get('/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { rows } = await pool.query(
      `
      SELECT e.employee_id, e.name, e.email, e.office_location, e.job_title,
             e.department, e.unit, e.line_manager, e.in_role_since, e.hire_date
      FROM employees e
      WHERE e.employee_id = $1
      `,
      [employeeId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// GET /api/employees/:employeeId/skills
router.get('/:employeeId/skills', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { rows } = await pool.query(
      `
      SELECT function_area, specialization, skill_name
      FROM skills
      WHERE employee_id = $1
      ORDER BY function_area, specialization, skill_name
      `,
      [employeeId]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

export default router;
