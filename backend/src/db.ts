import { Pool } from 'pg';
import fs from 'fs';

console.log(process.env.DATABASE_URL);

let pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function migrate() {
  pool.query(`CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT NOW()
              )`);

  const files = fs.readdirSync('./migrations')

  files.sort();

  for (let i = 0; i < files.length; i++) {
    let regex = /(?<id>[\d])+\-(?<name>[\w\d\-]+)\.sql/;
    let match = regex.exec(files[i]);
    if (match) {
      const id = parseInt(match.groups.id);

      const result = await pool.query(`SELECT id FROM migrations WHERE id = ${id}`);

      if (result.rows.length === 0) {
        const name = match.groups.name;

        const sql = fs.readFileSync(`./migrations/${files[i]}`, 'utf8');
        pool.query('BEGIN').then(async () => {
          await pool.query(`INSERT INTO migrations (id, name) VALUES ($1, $2)`, [id, name]);
          await pool.query(sql);
          await pool.query('COMMIT');
          console.log(`Migration ${id}: ${name}`);
        }).catch(async () => {
          await pool.query('ROLLBACK');
          console.log(`Migration ${id} failed`);
        })
      }
    }
  }
}

export default pool;
