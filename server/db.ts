
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

// Parse the JDBC URL to get connection details
const dbHost = process.env.DB_HOST || 'db2.sillydevelopment.co.uk';
const dbPort = parseInt(process.env.DB_PORT || '3306');
const dbUser = process.env.DB_USER || 'u77272_CezJ7ZJDoG';
const dbPassword = process.env.DB_PASSWORD || '4R.u8LGwD10VjCh84af=k4Vh';
const dbName = process.env.DB_NAME || 's77272_axiom';

if (!dbHost || !dbUser || !dbPassword || !dbName) {
  throw new Error(
    "Database credentials must be set. Please check your environment variables.",
  );
}

console.log('Connecting to MySQL database:', { host: dbHost, port: dbPort, user: dbUser, database: dbName });

// Create MySQL connection pool for better reliability
export const connection = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  idleTimeout: 60000,
});

export const db = drizzle(connection, { schema, mode: 'default' });

// Test the connection
connection.getConnection()
  .then(conn => {
    console.log('✅ MySQL database connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to database:', err);
  });
