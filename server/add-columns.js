const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:admin@localhost:5432/ems_db' });

async function addColumns() {
  try {
    // Add max_current column
    await pool.query(`
      ALTER TABLE assets 
      ADD COLUMN IF NOT EXISTS max_current DOUBLE PRECISION DEFAULT 80.0
    `);
    console.log('✓ max_current column added');

    // Add websocketlink column
    await pool.query(`
      ALTER TABLE assets 
      ADD COLUMN IF NOT EXISTS websocketlink VARCHAR(255)
    `);
    console.log('✓ websocketlink column added');

    console.log('\nAll columns added successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
}

addColumns();