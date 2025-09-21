
import { defineConfig } from "drizzle-kit";

// Get database credentials from environment
const dbHost = process.env.DB_HOST || 'db2.sillydevelopment.co.uk';
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER || 'u77272_CezJ7ZJDoG';
const dbPassword = process.env.DB_PASSWORD || '4R.u8LGwD10VjCh84af=k4Vh';
const dbName = process.env.DB_NAME || 's77272_axiom';

console.log('Drizzle config - Database credentials:', { host: dbHost, port: dbPort, user: dbUser, database: dbName });

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  },
});
