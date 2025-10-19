import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Load JSON data
const employeesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'Employee_Profiles.json'), 'utf8')
);

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const emp of employeesData) {
      // Insert main employee record
      const empResult = await client.query(
        `INSERT INTO employees (
          employee_id, name, email, office_location, job_title, 
          department, unit, line_manager, in_role_since, hire_date, last_updated
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING employee_id`,
        [
          emp.employee_id,
          emp.personal_info.name,
          emp.personal_info.email,
          emp.personal_info.office_location,
          emp.employment_info.job_title,
          emp.employment_info.department,
          emp.employment_info.unit,
          emp.employment_info.line_manager,
          emp.employment_info.in_role_since,
          emp.employment_info.hire_date,
          emp.employment_info.last_updated
        ]
      );
      
      const employeeId = empResult.rows[0].employee_id;
      
      // Insert languages
      for (const lang of emp.personal_info.languages) {
        await client.query(
          'INSERT INTO languages (employee_id, language, proficiency) VALUES ($1, $2, $3)',
          [employeeId, lang.language, lang.proficiency]
        );
      }
      
      // Insert skills
      for (const skill of emp.skills) {
        await client.query(
          'INSERT INTO skills (employee_id, function_area, specialization, skill_name) VALUES ($1, $2, $3, $4)',
          [employeeId, skill.function_area, skill.specialization, skill.skill_name]
        );
      }
      
      // Insert competencies
      for (const comp of emp.competencies) {
        await client.query(
          'INSERT INTO competencies (employee_id, name, level) VALUES ($1, $2, $3)',
          [employeeId, comp.name, comp.level]
        );
      }
      
      // Insert experiences
      for (const exp of emp.experiences) {
        await client.query(
          'INSERT INTO experiences (employee_id, type, organization, program, start_date, end_date, focus) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [employeeId, exp.type, exp.organization, exp.program, exp.period.start, exp.period.end, exp.focus]
        );
      }
      
      // Insert position history
      for (const pos of emp.positions_history) {
        await client.query(
          'INSERT INTO positions_history (employee_id, role_title, organization, start_date, end_date, focus_area, key_skills_used) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [employeeId, pos.role_title, pos.organization, pos.period.start, pos.period.end, pos.focus_areas || [], pos.key_skills_used || []]
        );
      }
      
      // Insert projects
      for (const proj of emp.projects) {
        const projResult = await client.query(
          'INSERT INTO projects (employee_id, project_name, role, start_date, end_date, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
          [employeeId, proj.project_name, proj.role, proj.period.start, proj.period.end, proj.description]
        );
        
        const projectId = projResult.rows[0].id;
        
        // Insert project outcomes
        for (const outcome of proj.outcomes) {
          await client.query(
            'INSERT INTO project_outcomes (project_id, outcome) VALUES ($1, $2)',
            [projectId, outcome]
          );
        }
      }
      
      // Insert education
      for (const edu of emp.education) {
        await client.query(
          'INSERT INTO education (employee_id, degree, institution, start_date, end_date) VALUES ($1, $2, $3, $4, $5)',
          [employeeId, edu.degree, edu.institution, edu.period.start, edu.period.end]
        );
      }
      
      console.log(`✅ Inserted employee: ${emp.personal_info.name}`);
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 Database seeded successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();
