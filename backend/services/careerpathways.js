import fetch from "node-fetch";
import { pool } from "../db.js";

const AZURE_OPENAI_BASE = process.env.AZURE_OPENAI_BASE || "https://psacodesprint2025.azure-api.net";
const DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4.1-nano";
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION || "2025-01-01-preview";

export class CareerPathways {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
  }

  /**
   * Main entry: assess pathways from an aspiration
   */
  async assessFromAspiration(employeeId, aspiration) {
    const [emp, empSkills, catalogue] = await Promise.all([
      this.getEmployee(employeeId),
      this.getEmployeeSkills(employeeId),
      this.getCatalogueSkills(aspiration.function_area, aspiration.specialization),
    ]);
    if (!emp) throw new Error(`Employee ${employeeId} not found`);

    const prompt = this.buildPrompt({ emp, empSkills, catalogue, aspiration });
    const llmText = await this.callAzureOpenAI(prompt);

    const parsed = safeParseJson(llmText, null);
    return this.normalizeOrFallback({ parsed, empSkills, catalogue, aspiration });
  }

  async getEmployee(employeeId) {
    const { rows } = await pool.query(
      `SELECT employee_id, name, email, job_title, department, unit, hire_date, in_role_since
       FROM employees WHERE employee_id=$1`,
      [employeeId]
    );
    return rows[0];
  }

  async getEmployeeSkills(employeeId) {
    const { rows } = await pool.query(
      `SELECT function_area, specialization, skill_name
       FROM skills WHERE employee_id=$1
       ORDER BY function_area, specialization, skill_name`,
      [employeeId]
    );
    return rows;
  }

  async getCatalogueSkills(functionArea, specialization) {
    const params = [functionArea];
    let sql = `
      SELECT function_area, specialization, skill_name
      FROM skills
      WHERE employee_id IS NULL AND function_area = $1
    `;
    if (specialization) {
      sql += ` AND specialization = $2`;
      params.push(specialization);
    }
    sql += ` ORDER BY specialization, skill_name`;
    const { rows } = await pool.query(sql, params);
    return rows;
  }

  /* LLM prompt & call */

  buildPrompt({ emp, empSkills, catalogue, aspiration }) {
    const have = Array.from(new Set(empSkills.map((s) => s.skill_name))).sort();
    const req = Array.from(new Set(catalogue.map((r) => r.skill_name))).sort();

    return `
You are an AI career coach for a global ports/logistics organization.

EMPLOYEE
- Name: ${emp.name}
- Current Role: ${emp.job_title}
- Department/Unit: ${emp.department} / ${emp.unit}
- Current skills: ${have.join(", ") || "None recorded"}

ASPIRATION
- Function Area: ${aspiration.function_area}
- Specialization: ${aspiration.specialization || "Any"}
- Short-term goal: ${aspiration.short_term || "N/A"}
- Long-term goal: ${aspiration.long_term || "N/A"}

CATALOGUE REQUIRED SKILLS (org-level)
${req.join(", ") || "None"}

TASK
Return ONLY JSON with this exact top-level shape:
{
  "pathways":[
    {
      "title":"<role/pathway>",
      "readiness": 0-100,                // % of required skills already possessed
      "time_estimate": "Now|6-9 months|12-15 months",
      "required_skills": ["..."],
      "gaps": ["..."],
      "tags": ["..."]
    }
  ],
  "internal_opportunities":[
    {
      "title":"<role>",
      "unit":"<unit/team>",
      "location":"<site/country>",
      "posted_at":"YYYY-MM-DD",
      "match": 0-100,
      "tags": ["..."]
    }
  ]
}
Use the catalogue to compute readiness & gaps; be concise and consistent.
`;
  }

  async callAzureOpenAI(prompt) {
    const url = `${AZURE_OPENAI_BASE}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-key": this.apiKey },
      body: JSON.stringify({
        model: DEPLOYMENT,
        temperature: 0.2,
        max_tokens: 1200,
        messages: [
          { role: "system", content: "You are a helpful assistant. Always return valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!r.ok) throw new Error(`Azure OpenAI error ${r.status}: ${await r.text()}`);
    const data = await r.json();
    return data?.choices?.[0]?.message?.content ?? "{}";
  }

  /* Parsing & fallback */

  normalizeOrFallback({ parsed, empSkills, catalogue, aspiration }) {
    const req = Array.from(new Set(catalogue.map((r) => r.skill_name)));
    const have = new Set(empSkills.map((s) => s.skill_name));
    const gaps = req.filter((s) => !have.has(s));
    const readiness = Math.round(((req.length - gaps.length) / Math.max(1, req.length)) * 100);
    const time = gaps.length === 0 ? "Now" : gaps.length <= 3 ? "6-9 months" : "12-15 months";

    const fallback = {
      pathways: [
        {
          title: aspiration.specialization
            ? `${aspiration.function_area} — ${aspiration.specialization}`
            : aspiration.function_area,
          readiness,
          time_estimate: time,
          required_skills: req.sort(),
          gaps: gaps.sort(),
          tags: [],
        },
      ],
      internal_opportunities: [],
    };

    if (!parsed || typeof parsed !== "object") return fallback;

    const clean = { ...fallback };
    if (Array.isArray(parsed.pathways) && parsed.pathways.length) clean.pathways = parsed.pathways;
    if (Array.isArray(parsed.internal_opportunities))
      clean.internal_opportunities = parsed.internal_opportunities;
    return clean;
  }
}

/* utils */

function safeParseJson(text, fallback) {
  if (typeof text !== "string") return fallback;
  const fence = text.match(/```(?:json)?([\s\S]*?)```/i);
  const body = fence ? fence[1]?.trim() : text.trim();
  try {
    return JSON.parse(body);
  } catch {
    return fallback;
  }
}
