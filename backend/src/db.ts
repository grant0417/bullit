import { Pool } from 'pg';
import fs from 'fs';

console.log(process.env.DATABASE_URL);

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function migrate() {
  await pool.query(`CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                sql TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
              )`);

  const regex = /(?<id>[\d])+\-(?<name>[\w\d\-]+)\.sql/;

  const files = fs
    .readdirSync('./migrations')
    .map((file) => regex.exec(file))
    .filter((match) => match !== null)
    .map((match) => {
      return { file: match.input, id: parseInt(match[1]), name: match[2] };
    })
    .sort((a, b) => a.id - b.id);

  for (const file of files) {
    const result = await pool.query(
      `SELECT id, sql FROM migrations WHERE id = ${file.id}`
    );

    const sql = fs.readFileSync(`./migrations/${file.file}`, 'utf8');

    if (result.rows.length === 0) {
      await pool.query('BEGIN');
      try {
        await pool.query(
          `INSERT INTO migrations (id, name, sql) VALUES ($1, $2, $3)`,
          [file.id, file.name, sql]
        );
        await pool.query(sql);
        await pool.query('COMMIT');
        console.log(`Migration ${file.id} (${file.name}): migrated`);
      } catch {
        await pool.query('ROLLBACK');
        console.log(`Migration ${file.id} (${file.name}): failed`);
      }
    } else {
      // if (result.rows[0].sql === sql) {
      //   console.log(`Migration ${file.id} (${file.name}): already migrated`);
      // } else {
      //   console.log(
      //     `Migration ${file.id} (${file.name}): migration discrepency`
      //   );
      // }
    }
  }
}

export default pool;
