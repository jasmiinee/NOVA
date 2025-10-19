// used to create HTTP route
import express from "express";
import { chatWithAI } from "../aiClient.js";
import { pool } from "../../db.js";
import { authenticateToken } from "./auth.js";

const router = express.Router();

// fetches relevant employee information to give context for the ai chatbot
async function getUserContext(employeeId) {
  try {
    // fetch employee info
    const empResult = await pool.query(
      'SELECT * FROM employees WHERE employee_id = $1',
      [employeeId]
    );
    // return empty string if no match found
    if (empResult.rows.length === 0) {
      return "";
    }

    const employee = empResult.rows[0];

    // fetch employee's skills and specialisation
    const skillsResult = await pool.query(
      'SELECT DISTINCT function_area, specialization FROM skills WHERE employee_id = $1',
      [employeeId]
    );

    // fetch employee's competencies
    const competenciesResult = await pool.query(
      'SELECT name, level FROM competencies WHERE employee_id = $1',
      [employeeId]
    );

    // fetch position history (fetches last 3 positions)
    const positionsResult = await pool.query(
      'SELECT role_title, organization, start_date, end_date FROM positions_history WHERE employee_id = $1 ORDER BY start_date DESC LIMIT 3',
      [employeeId]
    );

    // fetch education
    const educationResult = await pool.query(
      'SELECT degree, institution FROM education WHERE employee_id = $1',
      [employeeId]
    );

    // build context string
    const skills = skillsResult.rows
      .map(s => `${s.specialization} (${s.function_area})`)
      .join(', ');

    const competencies = competenciesResult.rows
      .map(c => `${c.name} (${c.level})`)
      .join(', ');

    const education = educationResult.rows
      .map(e => `${e.degree} from ${e.institution}`)
      .join(', ');

    const positions = positionsResult.rows
      .map(p => `${p.role_title} at ${p.organization} (${p.start_date} - ${p.end_date})`)
      .join('\n');

    // combine everything into a text that the ai can read
    return `
Employee Profile:
- Name: ${employee.name}
- Current Role: ${employee.job_title}
- Department: ${employee.department}
- In role since: ${employee.in_role_since}
- Location: ${employee.office_location}

Skills & Expertise:
${skills || 'Not specified'}

Competencies:
${competencies || 'Not specified'}

Education:
${education || 'Not specified'}

Previous Roles:
${positions || 'Not specified'}`;
  } catch (err) {
    console.error('Error fetching user context:', err);
    return "";
  }
}

// send everything to the ai chatbot
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    const employeeId = req.employeeId;

    if (!message) return res.status(400).json({ error: "Message is required" });
    if (!employeeId) return res.status(400).json({ error: "employeeId missing on request" });

    console.log("[chat] employeeId =", employeeId);

    const userContext = await getUserContext(employeeId);
    console.log("[chat] userContext length =", userContext.length);

    const systemPrompt = `You are PSA's AI Career Coach. You have access to the following employee profile:

${userContext || "(No profile data found for this employeeId)"}

Your role is to:
1. Answer specific career development questions based on their profile
2. Provide personalized guidance aligned with their current role and skills
3. Suggest learning resources and opportunities for growth
4. Support their professional development journey
5. Provide conversational support for worker's engagement, mental well-being and continuous development

If the profile is empty or incomplete, ask for the missing details (role, department, skills, goals) before giving guidance.
Be concise, actionable, and encouraging. Keep responses to 2-3 paragraphs unless more detail is needed.`;

    const reply = await chatWithAI(message, systemPrompt);
    res.json({ reply });
  } catch (e) {
    console.error("Chat error:", e);
    res.status(500).json({ error: "Chat failed", details: e.message });
  }
});

export default router;