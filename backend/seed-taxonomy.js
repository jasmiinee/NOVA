import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 60) + '...');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL missing');


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedTaxonomy() {
  const client = await pool.connect();
  
  try {
    // Read CSV file
    const csvPath = path.join(__dirname, 'Functions-Skills-List.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV (skip header row)
    const lines = csvContent.split('\n').slice(1);
    
    await client.query('BEGIN');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      // Simple CSV parsing (handles basic quoted strings)
      const match = line.match(/^"?([^",]+)"?,\s*"?([^"]+)"?$/);
      if (!match) continue;
      
      const [, functionArea, specialization] = match;
      
      await client.query(
        `INSERT INTO skills_taxonomy (function_area, specialization)
         VALUES ($1, $2)
         ON CONFLICT (function_area, specialization) DO NOTHING`,
        [functionArea.trim(), specialization.trim()]
      );
    }
    
    await client.query('COMMIT');
    
    // Display summary
    const result = await client.query('SELECT COUNT(*) FROM skills_taxonomy');
    console.log(`✅ Loaded ${result.rows[0].count} skills into taxonomy`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding taxonomy:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTaxonomy();
