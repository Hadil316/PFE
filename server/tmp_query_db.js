const { Client } = require('pg');
(async () => {
  try {
    const client = new Client({ connectionString: 'postgresql://postgres:hadil123@localhost:5432/ems_db' });
    await client.connect();
    const assets = await client.query('SELECT id, name, webSocketLink FROM assets LIMIT 20');
    console.log('ASSETS', JSON.stringify(assets.rows, null, 2));
    const measures = await client.query('SELECT asset_id, COUNT(*) AS cnt, MIN(timestamp) AS first_ts, MAX(timestamp) AS last_ts FROM measurements GROUP BY asset_id ORDER BY asset_id');
    console.log('MEASURES', JSON.stringify(measures.rows, null, 2));
    await client.end();
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
