import pg from "pg";
const { Pool } = pg;

const {
  DB_HOST = "localhost",
  DB_PORT = "5432",
  DB_NAME = "ecommerce",
  DB_USER = "ecommerce",
  DB_PASSWORD = "ecommerce",
} = process.env;

export const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
});

// ✅ T debe extender QueryResultRow
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params);
}
