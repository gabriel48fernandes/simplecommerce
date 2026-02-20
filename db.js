import pg from "pg";

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
      }
);

console.log("🔥 DB CONFIG:", {
  nodeEnv: process.env.NODE_ENV,
  usandoDatabaseUrl: isProduction,
});