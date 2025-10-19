import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// GET /api/mentors/skills-taxonomy
// Uses Supabase skills_taxonomy table which includes skill_name
router.get('/mentors/skills-taxonomy', async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, function_area, specialization, skill_name
       FROM skills_taxonomy
       WHERE skill_name IS NOT NULL AND TRIM(skill_name) <> ''
       ORDER BY function_area, skill_name`
    );
    res.json({ skills: result.rows });
  } catch (err) {
    console.error('Error fetching skills taxonomy:', err);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// GET /api/mentors/check-if-mentor/:employeeId
router.get('/mentors/check-if-mentor/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    
    const result = await pool.query(
      'SELECT id FROM mentors WHERE employee_id = $1',
      [employeeId]
    );
    
    res.json({
      is_mentor: result.rows.length > 0,
      mentor_id: result.rows[0]?.id || null
    });
  } catch (err) {
    console.error('Error checking mentor status:', err);
    res.status(500).json({ error: 'Failed to check mentor status' });
  }
});

// GET /api/mentors/matches/:employeeId
router.get('/mentors/matches/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Get mentee's info
    const menteeResult = await pool.query(
      'SELECT employee_id, name, job_title FROM employees WHERE employee_id = $1',
      [employeeId]
    );
    
    if (menteeResult.rows.length === 0) {
      return res.json({ mentor_matches: [] });
    }

    // Find matching mentors (exclude self, with available slots)
    const mentorsQuery = `
      SELECT 
        m.id,
        m.employee_id,
        e.name as mentor_name,
        e.job_title as current_role,
        m.bio,
        m.mentoring_skills,
        m.max_mentees,
        m.available_slots,
        m.mentoring_tagline as tagline,
        e.hire_date
      FROM mentors m
      JOIN employees e ON m.employee_id = e.employee_id
      WHERE m.employee_id != $1 AND m.available_slots > 0
      ORDER BY m.available_slots DESC
      LIMIT 10
    `;

    const mentorsResult = await pool.query(mentorsQuery, [employeeId]);
    
    const mentorMatches = mentorsResult.rows.map(mentor => {
      // Simple match score based on availability + mentoring skills count
      const skillCount = mentor.mentoring_skills?.length || 0;
      const matchScore = Math.min(100, 60 + (skillCount * 5) + (mentor.available_slots * 5));

      return {
        mentor_id: mentor.id,
        mentor_name: mentor.mentor_name,
        current_role: mentor.current_role,
        mentor_skills: mentor.mentoring_skills || [],
        available_slots: mentor.available_slots,
        match_score: matchScore,
        tagline: mentor.tagline,
        bio: mentor.bio
      };
    });

    res.json({ mentor_matches: mentorMatches });
  } catch (err) {
    console.error('Error fetching mentor matches:', err);
    res.status(500).json({ error: 'Failed to fetch mentor matches' });
  }
});

// POST /api/mentors/register
router.post('/mentors/register', async (req, res) => {
  try {
    const { employee_id, mentoring_skills, max_mentees, bio } = req.body;

    // Check if already a mentor
    const existingMentor = await pool.query(
      'SELECT id FROM mentors WHERE employee_id = $1',
      [employee_id]
    );

    if (existingMentor.rows.length > 0) {
      return res.status(400).json({ error: 'Already registered as a mentor' });
    }

    const result = await pool.query(
      `INSERT INTO mentors (employee_id, mentoring_skills, max_mentees, bio, available_slots)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [employee_id, mentoring_skills, max_mentees, bio, max_mentees]
    );

    res.json({
      success: true,
      mentor_id: result.rows[0].id
    });
  } catch (err) {
    console.error('Error registering mentor:', err);
    res.status(500).json({ error: 'Failed to register as mentor' });
  }
});

// POST /api/mentors/request-mentorship
router.post('/mentors/request-mentorship', async (req, res) => {
  try {
    const { mentee_id, mentor_id, goals, message, frequency, preferred_time } = req.body;

    // Convert numeric mentor_id to employee_id if needed
    let mentorEmployeeId = mentor_id;
    if (typeof mentor_id === 'number' || (typeof mentor_id === 'string' && !mentor_id.startsWith('EMP'))) {
      const mentorResult = await pool.query(
        'SELECT employee_id FROM mentors WHERE id = $1',
        [mentor_id]
      );
      if (mentorResult.rows.length === 0) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
      mentorEmployeeId = mentorResult.rows[0].employee_id;
    }

    // Generate unique request_id
    const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const result = await pool.query(
      `INSERT INTO mentorship_requests 
       (request_id, mentee_id, mentor_id, requested_skills, mentee_message, frequency, preferred_time, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
       RETURNING id`,
      [requestId, mentee_id, mentorEmployeeId, goals, message, frequency, preferred_time]
    );

    res.json({
      success: true,
      request_id: requestId
    });
  } catch (err) {
    console.error('Error requesting mentorship:', err);
    res.status(500).json({ error: 'Failed to request mentorship' });
  }
});

// GET /api/mentors/requests/:mentorEmployeeId
router.get('/mentors/requests/:mentorEmployeeId', async (req, res) => {
  try {
    const { mentorEmployeeId } = req.params;

    const result = await pool.query(
      `SELECT 
        mr.request_id,
        mr.mentee_id,
        e.name as mentee_name,
        e.job_title as mentee_role,
        mr.requested_skills,
        mr.mentee_message,
        mr.frequency,
        mr.preferred_time,
        mr.status,
        mr.created_at
       FROM mentorship_requests mr
       JOIN employees e ON mr.mentee_id = e.employee_id
       WHERE mr.mentor_id = $1 AND mr.status = 'pending'
       ORDER BY mr.created_at DESC`,
      [mentorEmployeeId]
    );

    res.json({
      pending_requests: result.rows
    });
  } catch (err) {
    console.error('Error fetching mentoring requests:', err);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

// POST /api/mentors/respond-to-request
router.post('/mentors/respond-to-request', async (req, res) => {
  try {
    const { request_id, response } = req.body;

    if (response === 'accepted') {
      // Get request details
      const reqResult = await pool.query(
        'SELECT mentee_id, mentor_id FROM mentorship_requests WHERE request_id = $1',
        [request_id]
      );

      if (reqResult.rows.length === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      const { mentee_id, mentor_id } = reqResult.rows[0];

      // Generate unique mentorship_id
      const mentorshipId = `MNT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create mentorship
      await pool.query(
        `INSERT INTO mentorships (mentorship_id, mentee_id, mentor_id, status)
         VALUES ($1, $2, $3, 'active')`,
        [mentorshipId, mentee_id, mentor_id]
      );

      // Decrement available slots for mentor
      await pool.query(
        'UPDATE mentors SET available_slots = available_slots - 1 WHERE employee_id = $1',
        [mentor_id]
      );
    }

    // Update request status
    await pool.query(
      'UPDATE mentorship_requests SET status = $1, accepted_at = NOW() WHERE request_id = $2',
      [response === 'accepted' ? 'accepted' : 'rejected', request_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error responding to request:', err);
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

// GET /api/mentors/active-mentorships/:mentorEmployeeId
router.get('/mentors/active-mentorships/:mentorEmployeeId', async (req, res) => {
  try {
    const { mentorEmployeeId } = req.params;

    const result = await pool.query(
      `SELECT 
        m.mentorship_id,
        m.mentee_id,
        e_mentee.name as mentee_name,
        e_mentee.job_title as mentee_role,
        m.status,
        m.start_date
       FROM mentorships m
       JOIN employees e_mentee ON m.mentee_id = e_mentee.employee_id
       WHERE m.mentor_id = $1 AND m.status = 'active'
       ORDER BY m.start_date DESC`,
      [mentorEmployeeId]
    );

    const activeMentorships = result.rows.map(ms => ({
      mentorship_id: ms.mentorship_id,
      mentee_name: ms.mentee_name,
      mentee_role: ms.mentee_role,
      sessions_completed: 0,
      next_session_date: 'To be scheduled',
      duration_months: Math.max(1, Math.ceil(
        (new Date() - new Date(ms.start_date)) / (1000 * 60 * 60 * 24 * 30)
      ))
    }));

    res.json({ active_mentorships: activeMentorships });
  } catch (err) {
    console.error('Error fetching active mentorships:', err);
    res.status(500).json({ error: 'Failed to fetch mentorships' });
  }
});

// GET /api/mentors/my-mentors/:menteeId
router.get('/mentors/my-mentors/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;

    const result = await pool.query(
      `SELECT 
        m.mentorship_id,
        m.mentor_id,
        e_mentor.name as mentor_name,
        e_mentor.job_title as mentor_role,
        mentor.bio as mentor_bio,
        mentor.mentoring_skills,
        m.status,
        m.start_date,
        mr.frequency,
        mr.preferred_time,
        mr.requested_skills as mentee_goals
       FROM mentorships m
       LEFT JOIN employees e_mentor ON m.mentor_id = e_mentor.employee_id
       LEFT JOIN mentors mentor ON e_mentor.employee_id = mentor.employee_id
       LEFT JOIN mentorship_requests mr ON m.mentee_id = mr.mentee_id AND m.mentor_id = mr.mentor_id
       WHERE m.mentee_id = $1 AND m.status = 'active'
       ORDER BY m.start_date DESC`,
      [menteeId]
    );

    console.log('Active mentors query result:', result.rows);

    const activeMentors = result.rows.map(ms => ({
      mentorship_id: ms.mentorship_id,
      mentor_name: ms.mentor_name,
      mentor_role: ms.mentor_role,
      mentor_bio: ms.mentor_bio,
      mentor_skills: ms.mentoring_skills || [],
      mentor_rating: 0,
      mentor_reviews_count: 0,
      sessions_completed: 0,
      next_session_date: 'Not scheduled',
      duration_months: ms.start_date ? Math.max(1, Math.ceil(
        (new Date() - new Date(ms.start_date)) / (1000 * 60 * 60 * 24 * 30)
      )) : 0,
      mentee_goals: ms.mentee_goals || [],
      frequency: ms.frequency,
      preferred_time: ms.preferred_time
    }));

    res.json({ active_mentors: activeMentors });
  } catch (err) {
    console.error('Error fetching mentee mentors:', err);
    res.status(500).json({ error: 'Failed to fetch your mentors' });
  }
});

// POST /api/mentors/schedule-session
router.post('/mentors/schedule-session', async (req, res) => {
  try {
    const { mentorship_id, proposed_date, proposed_time, agenda, session_type } = req.body;

    // Basic validation
    if (!mentorship_id || !proposed_date || !proposed_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Ensure the mentorship exists
    const mRes = await pool.query(
      'SELECT mentorship_id FROM mentorships WHERE mentorship_id = $1',
      [mentorship_id]
    );
    if (mRes.rows.length === 0) {
      return res.status(404).json({ error: 'Mentorship not found' });
    }

    const sessionId = `SES-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`;

    await pool.query(
      `INSERT INTO mentoring_sessions (
         session_id, mentorship_id, proposed_date, proposed_time, agenda, session_type, status
       ) VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
      [sessionId, mentorship_id, proposed_date, proposed_time, agenda || null, session_type || 'video']
    );

    res.json({ success: true, session_id: sessionId });
  } catch (err) {
    console.error('Error scheduling session:', err);
    res.status(500).json({ error: 'Failed to schedule session' });
  }
});

// POST /api/mentors/end-mentorship
router.post('/mentors/end-mentorship', async (req, res) => {
  try {
    const { mentorship_id, feedback, rating } = req.body;

    // Update mentorship status
    await pool.query(
      'UPDATE mentorships SET status = $1, end_date = NOW() WHERE mentorship_id = $2',
      ['completed', mentorship_id]
    );

    // Store feedback
    if (feedback || rating) {
      const mentorshipResult = await pool.query(
        'SELECT mentor_id, mentee_id FROM mentorships WHERE mentorship_id = $1',
        [mentorship_id]
      );

      if (mentorshipResult.rows.length > 0) {
        const { mentor_id, mentee_id } = mentorshipResult.rows[0];
        await pool.query(
          `INSERT INTO mentorship_feedback (mentorship_id, mentor_id, mentee_id, feedback, rating)
           VALUES ($1, $2, $3, $4, $5)`,
          [mentorship_id, mentor_id, mentee_id, feedback, rating]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error ending mentorship:', err);
    res.status(500).json({ error: 'Failed to end mentorship' });
  }
});

// GET /api/mentors/my-requests/:menteeId
router.get('/mentors/my-requests/:menteeId', async (req, res) => {
  try {
    const { menteeId } = req.params;

    const result = await pool.query(
      `SELECT 
        mr.id,
        mr.request_id,
        mr.mentor_id,
        e.name as mentor_name,
        e.job_title as mentor_role,
        m.bio as mentor_bio,
        m.mentoring_skills as mentor_skills,
        mr.requested_skills,
        mr.mentee_message,
        mr.frequency,
        mr.preferred_time,
        mr.status,
        mr.created_at,
        mr.accepted_at
       FROM mentorship_requests mr
       LEFT JOIN employees e ON mr.mentor_id = e.employee_id
       LEFT JOIN mentors m ON mr.mentor_id = m.employee_id
       WHERE mr.mentee_id = $1
       ORDER BY mr.created_at DESC`,
      [menteeId]
    );

    console.log('My requests query result:', result.rows);
    res.json({
      pending_requests: result.rows
    });
  } catch (err) {
    console.error('Error fetching my requests:', err);
    res.status(500).json({ error: 'Failed to fetch your requests' });
  }
});

// POST /api/mentors/cancel-request
router.post('/mentors/cancel-request', async (req, res) => {
  try {
    const { request_id } = req.body;

    // Check request status
    const reqResult = await pool.query(
      'SELECT status FROM mentorship_requests WHERE request_id = $1',
      [request_id]
    );

    if (reqResult.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (reqResult.rows[0].status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel non-pending requests' });
    }

    // Delete the request
    await pool.query(
      'DELETE FROM mentorship_requests WHERE request_id = $1',
      [request_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error cancelling request:', err);
    res.status(500).json({ error: 'Failed to cancel request' });
  }
});

export default router;
