import fetch from 'node-fetch';
import { pool } from '../db.js';

const AZURE_OPENAI_BASE = 'https://psacodesprint2025.azure-api.net';
const DEPLOYMENT = 'gpt-4.1-nano';
const API_VERSION = '2025-01-01-preview';

export class LeadershipPotential {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  async assessEmployee(employeeId) {
    // 1. Fetch employee data from database
    const employee = await this.fetchEmployeeData(employeeId);
    
    if (!employee) {
      throw new Error(`Employee ${employeeId} not found`);
    }

    // 2. Construct comprehensive prompt with structured data
    const prompt = this.buildAssessmentPrompt(employee);

    // 3. Call Azure OpenAI
    const llmResponse = await this.callAzureOpenAI(prompt);

    // 4. Parse LLM response into structured format
    const assessment = this.parseAssessment(llmResponse, employee);

    return assessment;
  }

  async fetchEmployeeData(employeeId) {
    const client = await pool.connect();
    try {
      // Fetch employee
      const empResult = await client.query(
        `SELECT * FROM employees WHERE employee_id = $1`,
        [employeeId]
      );
      if (empResult.rows.length === 0) return null;
      const emp = empResult.rows[0];

      // Fetch positions history
      const posResult = await client.query(
        `SELECT role_title, organization, start_date, end_date, focus_area, key_skills_used
         FROM positions_history 
         WHERE employee_id = $1 
         ORDER BY start_date DESC`,
        [employeeId]
      );

      // Fetch skills
      const skillsResult = await client.query(
        `SELECT function_area, specialization, skill_name 
         FROM skills 
         WHERE employee_id = $1`,
        [employeeId]
      );

      // Fetch projects
      const projResult = await client.query(
        `
        SELECT
            p.id,
            p.project_name,
            p.role,
            p.start_date,
            p.end_date,
            p.description,
            COALESCE(
            ARRAY_REMOVE(ARRAY_AGG(o.outcome ORDER BY o.id), NULL),
            '{}'::text[]
            ) AS outcomes
        FROM projects p
        LEFT JOIN project_outcomes o
            ON o.project_id = p.id
        WHERE p.employee_id = $1
        GROUP BY p.id, p.project_name, p.role, p.start_date, p.end_date, p.description
        ORDER BY p.start_date DESC
        `,
        [employeeId]
    );

      // Fetch experiences
      const expResult = await client.query(
        `SELECT *
         FROM experiences 
         WHERE employee_id = $1`,
        [employeeId]
      );

      return {
        employee_id: emp.employee_id,
        name: emp.name,
        email: emp.email,
        job_title: emp.job_title,
        department: emp.department,
        unit: emp.unit,
        hire_date: emp.hire_date,
        in_role_since: emp.in_role_since,
        line_manager: emp.line_manager,
        positions: posResult.rows,
        skills: skillsResult.rows,
        projects: projResult.rows,
        experiences: expResult.rows
      };
    } finally {
      client.release();
    }
  }

  buildAssessmentPrompt(employee) {
    const yearsAtPSA = this.calculateYears(employee.hire_date);
    const yearsInRole = this.calculateYears(employee.in_role_since);
    
    const positionsText = employee.positions
      .map(p => `- ${p.role_title} at ${p.organization || 'PSA'} (${p.start_date} to ${p.end_date || 'Present'})${p.focus_areas ? `. Focus: ${JSON.stringify(p.focus_areas)}` : ''}`)
      .join('\n');

    const skillsText = employee.skills
      .map(s => `- ${s.function_area} → ${s.specialization}: ${s.skill_name}`)
      .join('\n');

    const projectsText = employee.projects
      .map(p => `- ${p.project_name} (${p.role}): ${p.description}${p.outcomes ? `. Outcomes: ${JSON.stringify(p.outcomes)}` : ''}`)
      .join('\n');

    const experiencesText = employee.experiences
      .map(e => `- ${e.type}: ${e.program_name}${e.description ? ` - ${e.description}` : ''}`)
      .join('\n');

    return `
        You are an expert HR analyst specializing in leadership potential assessment.
        Analyze the following employee profile and predict their future leadership potential based on behavioral patterns, performance trajectory, and engagement indicators.

        # Employee Profile

        **Name:** ${employee.name}
        **Employee ID:** ${employee.employee_id}
        **Current Role:** ${employee.job_title}
        **Department:** ${employee.department}
        **Unit:** ${employee.unit}
        **Tenure at PSA:** ${yearsAtPSA.toFixed(1)} years (hired ${employee.hire_date})
        **Time in Current Role:** ${yearsInRole.toFixed(1)} years (since ${employee.in_role_since})
        **Reports to:** ${employee.line_manager || 'N/A'}

        ## Career Progression (Positions History)
        ${positionsText || 'No position history available'}

        ## Technical Skills & Competencies
        ${skillsText || 'No skills recorded'}

        ## Project Leadership & Impact
        ${projectsText || 'No projects recorded'}

        ## Learning & Development Experiences
        ${experiencesText || 'No experiences recorded'}

        # Assessment Task

        Based on this data, provide a **structured leadership potential assessment** with the following:

        1. **Overall Leadership Potential Score (0-100)**: Provide a numeric score.
        2. **Potential Tier**: Classify as HIGH POTENTIAL, MEDIUM-HIGH POTENTIAL, MEDIUM POTENTIAL, or DEVELOPING.
        3. **Readiness Statement**: One sentence describing their readiness for advancement.
        4. **Performance Analysis (0-100)**: Score based on career progression velocity, project impact, and outcomes delivery.
        5. **Learning Agility Analysis (0-100)**: Score based on skill diversity, role transitions, and stretch assignments.
        6. **Stability & Experience (0-100)**: Score based on tenure and consistency.
        7. **Key Strengths**: List 3-5 specific strengths observed from the data.
        8. **Development Areas**: List 2-3 areas for improvement.
        9. **Recommended Development Actions**: List 3 specific development interventions.
        10. **Next Role Recommendations**: Suggest 2-3 logical next career moves.
        11. **Risk Factors**: Identify any concerns (e.g., short tenure, limited project leadership, narrow skill base).
        12. **Behavioral Indicators**: Infer behavioral traits from the data (e.g., adaptability from role changes, initiative from project roles, learning orientation from experiences).

        # Output Format

        Return your assessment as a **valid JSON object** with this exact structure:

        \`\`\`json
        {
        "overall_score": 75,
        "tier": "MEDIUM-HIGH POTENTIAL",
        "readiness": "Ready for team lead or specialist lead roles",
        "component_scores": {
            "performance": 72,
            "learning_agility": 68,
            "stability": 80
        },
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "development_areas": ["area 1", "area 2"],
        "recommended_development": ["action 1", "action 2", "action 3"],
        "next_role_options": ["role 1", "role 2"],
        "risk_factors": ["risk 1"],
        "behavioral_indicators": {
            "adaptability": "high",
            "initiative": "medium",
            "learning_orientation": "high",
            "collaboration": "medium",
            "strategic_thinking": "emerging"
        },
        "narrative_summary": "A 2-3 sentence overall assessment of leadership potential and trajectory."
        }
        \`\`\`

        Be data-driven, fair, and specific in your assessment. Use only the information provided—do not invent data.`;
  }

  async callAzureOpenAI(prompt) {
    const url = `${AZURE_OPENAI_BASE}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey
      },
      body: JSON.stringify({
        model: DEPLOYMENT,
        messages: [
          {
            role: 'system',
            content: 'You are an expert HR analyst. Always return valid JSON in your responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temp for more consistent scoring
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Azure OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  parseAssessment(llmResponse, employee) {
    try {
        const parsed = safeParseJson(llmResponse, null) || {};

        // Normalize numeric fields and provide sane defaults
        const toNum = (v, d = 50) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : d;
        };

        const component = parsed.component_scores || {};
        const component_scores = {
        performance: toNum(component.performance, 50),
        learning_agility: toNum(component.learning_agility, 50),
        stability: toNum(component.stability, 50)
        };

        return {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        current_role: employee.job_title,
        current_department: employee.department,
        overall_score: toNum(parsed.overall_score, 50),
        tier: parsed.tier || 'MEDIUM POTENTIAL',
        readiness: parsed.readiness || 'Assessment in progress',
        component_scores,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        development_areas: Array.isArray(parsed.development_areas) ? parsed.development_areas : [],
        recommended_development: Array.isArray(parsed.recommended_development) ? parsed.recommended_development : [],
        next_role_options: Array.isArray(parsed.next_role_options) ? parsed.next_role_options : [],
        risk_factors: Array.isArray(parsed.risk_factors) ? parsed.risk_factors : [],
        behavioral_indicators: parsed.behavioral_indicators && typeof parsed.behavioral_indicators === 'object'
            ? parsed.behavioral_indicators
            : {},
        narrative_summary: typeof parsed.narrative_summary === 'string' ? parsed.narrative_summary : '',
        key_metrics: {
            years_tenure: this.calculateYears(employee.hire_date),
            years_in_role: this.calculateYears(employee.in_role_since),
            role_count: (employee.positions || []).length,
            skill_count: (employee.skills || []).length,
            project_count: (employee.projects || []).length,
            experience_count: (employee.experiences || []).length
        },
        generated_at: new Date().toISOString(),
        model_used: this.constructor?.DEPLOYMENT || 'gpt-4.1-nano'
        };
    } catch (e) {
        // Fallback object if parsing fails completely
        return {
        employee_id: employee.employee_id,
        employee_name: employee.name,
        current_role: employee.job_title,
        current_department: employee.department,
        overall_score: 50,
        tier: 'ASSESSMENT ERROR',
        readiness: 'Unable to complete assessment',
        component_scores: { performance: 50, learning_agility: 50, stability: 50 },
        strengths: [],
        development_areas: ['Assessment parsing failed'],
        recommended_development: ['Retry assessment'],
        next_role_options: [],
        risk_factors: ['Technical error in assessment generation'],
        behavioral_indicators: {},
        narrative_summary: String(llmResponse || '').slice(0, 200),
        error: e.message,
        generated_at: new Date().toISOString(),
        model_used: this.constructor?.DEPLOYMENT || 'gpt-4.1-nano'
        };
    }
  }

  calculateYears(dateStr) {
    if (!dateStr) return 0;
    const date = new Date(dateStr);
    const now = new Date();
    return (now - date) / (365.25 * 24 * 60 * 60 * 1000);
  }
}

function safeParseJson(text, fallback = {}) {
  if (typeof text !== 'string') return fallback;

  let jsonText = text.trim();

  // Try to extract JSON inside a code fence (```json ... ``` or ~~~json ... ~~~)
  const codeBlockMatch = jsonText.match(/```(?:json)?([\s\S]*?)```/i) || jsonText.match(/~~~(?:json)?([\s\S]*?)~~~/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    jsonText = codeBlockMatch[1].trim();
  } else {
    // Remove stray fences if they exist
    const fenceStart = /^(?:```|~~~)\s*(?:json)?/i;
    const fenceEnd = /(?:```|~~~)\s*$/i;
    jsonText = jsonText.replace(fenceStart, '').replace(fenceEnd, '').trim();
  }

  try {
    return JSON.parse(jsonText);
  } catch {
    return fallback;
  }
}