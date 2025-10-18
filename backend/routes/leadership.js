import express from 'express';
import { LeadershipPotential } from '../services/leadershipPotential.js';

const router = express.Router();
const assessor = new LeadershipPotential();

// GET /api/leadership/llm/:employeeId
router.get('/llm/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await assessor.assessEmployee(employeeId);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

export default router;