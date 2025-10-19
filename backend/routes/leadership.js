import express from 'express';
import { pool } from '../db.js';
import { LeadershipPotential } from '../services/leadershipPotential.js';

const router = express.Router();
const assessor = new LeadershipPotential();

// Cached endpoint with full data
router.get('/llm/:employeeId/cached', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Check if cached assessment exists (within last 30 days)
    const cached = await pool.query(
      `SELECT * FROM leadership_assessments 
       WHERE employee_id = $1 
       AND generated_at > NOW() - INTERVAL '30 days'`,
      [employeeId]
    );

    if (cached.rows.length > 0) {
      return res.json(cached.rows[0]);
    }

    // Generate new assessment via LLM
    const assessment = await assessor.assessEmployee(employeeId);

    // Store complete assessment in database
    await pool.query(
      `INSERT INTO leadership_assessments 
       (employee_id, overall_score, tier, readiness, component_scores, 
        strengths, development_areas, recommended_development, 
        next_role_options, risk_factors, model_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (employee_id) 
       DO UPDATE SET 
         overall_score = $2, 
         tier = $3, 
         readiness = $4, 
         component_scores = $5, 
         strengths = $6, 
         development_areas = $7,
         recommended_development = $8,
         next_role_options = $9,
         risk_factors = $10,
         model_used = $11,
         generated_at = NOW()`,
      [
        employeeId,
        assessment.overall_score,
        assessment.tier,
        assessment.readiness,
        JSON.stringify(assessment.component_scores),
        assessment.strengths,
        assessment.development_areas,
        assessment.recommended_development,
        assessment.next_role_options,
        assessment.risk_factors || [],
        assessment.model_used || 'GPT-4.1-nano'
      ]
    );

    res.json(assessment);
  } catch (error) {
    console.error('Error fetching cached leadership assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

// Lightweight score endpoint for Dashboard
router.get('/:employeeId/score', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pool.query(
      'SELECT overall_score, tier FROM leadership_assessments WHERE employee_id = $1',
      [employeeId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No assessment found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching leadership score:', error);
    res.status(500).json({ error: 'Failed to fetch score' });
  }
});

router.get('/llm/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const assessment = await assessor.assessEmployee(employeeId);
    
    // Optionally update cache here too
    await pool.query(
      `INSERT INTO leadership_assessments 
       (employee_id, overall_score, tier, readiness, component_scores, 
        strengths, development_areas, recommended_development, 
        next_role_options, risk_factors, model_used)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (employee_id) 
       DO UPDATE SET 
         overall_score = $2, tier = $3, readiness = $4, 
         component_scores = $5, strengths = $6, development_areas = $7,
         recommended_development = $8, next_role_options = $9, 
         risk_factors = $10, model_used = $11, generated_at = NOW()`,
      [
        employeeId,
        assessment.overall_score,
        assessment.tier,
        assessment.readiness,
        JSON.stringify(assessment.component_scores),
        assessment.strengths,
        assessment.development_areas,
        assessment.recommended_development,
        assessment.next_role_options,
        assessment.risk_factors || [],
        assessment.model_used || 'GPT-4.1-nano'
      ]
    );
    
    res.json(assessment);
  } catch (error) {
    console.error('Error generating leadership assessment:', error);
    res.status(500).json({ error: 'Failed to generate assessment' });
  }
});

export default router;