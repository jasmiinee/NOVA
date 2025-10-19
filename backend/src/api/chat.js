// used to create HTTP route
import express from "express";
import { chatWithAI } from "../aiClient.js";
import { pool } from "../../db.js";

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
      ${positionsResult.rows.map(p => `${p.role_title} at ${p.organization} (${p.start_date} - ${p.end_date})`).join('\n') || 'Not specified'}
      `;
        } catch (err) {
          console.error('Error fetching user context:', err);
          return "";
        }
      }

      // send everything to the ai chatbot
      router.post("/", async (req, res) => {
        try {
          const { message, employeeId } = req.body;
          
          const userContext = await getUserContext(employeeId);

          // guidelines for ai chatbot
          const systemPrompt = `You are PSA's AI Chatbot. You have access to the following employee profile:

      ${userContext}

      Your role is to:
      1. Answer specific career development questions based on their profile
      2. Provide personalized guidance aligned with their current role and skills
      3. Suggest learning resources and opportunities for growth
      4. Support their professional development journey
      5. Provide conversational support for worker's engagement, mental well-being and continuous development 

      Be concise, actionable, and encouraging. Keep responses to 2-3 paragraphs unless more detail is needed.`;

      // sends both the user’s question and systemPrompt to chatWithAI() function, which generates a reply
          const reply = await chatWithAI(message, systemPrompt);
          // backend's response to the frontend message with the ai's message
          res.json({ reply });
        } catch (e) {
          console.error(e);
          res.status(500).json({ error: "Chat failed", details: e.message });
        }
  });

  export default router;