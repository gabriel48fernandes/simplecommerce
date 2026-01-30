import pkg from "pg";
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
        family: 4, // 🔥 ESSENCIAL
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

export { pool };
