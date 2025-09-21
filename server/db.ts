
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database connection configuration for Render deployment
// These environment variables must be set in your Render dashboard
let dbHost = process.env.DB_HOST;
let dbPort = parseInt(process.env.DB_PORT || '3306');
let dbUser = process.env.DB_USER;
let dbPassword = process.env.DB_PASSWORD;
let dbName = process.env.DB_NAME;

// Support for DATABASE_URL (common on Render and other platforms)
if (!dbHost && process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  dbHost = url.hostname;
  dbPort = parseInt(url.port || '3306');
  dbUser = url.username;
  dbPassword = url.password;
  dbName = url.pathname.slice(1); // Remove leading slash
}

// Check for database credentials
if (!dbHost || !dbUser || !dbPassword || !dbName) {
  console.error('❌ Database credentials missing. Please set the following in .env file:');
  console.error('- DB_HOST (your database host)');
  console.error('- DB_USER (your database username)');
  console.error('- DB_PASSWORD (your database password)');
  console.error('- DB_NAME (your database name)');
  console.error('- DB_PORT (your database port, usually 3306)');
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      "Database credentials must be set in .env file. Please check your environment variables.",
    );
  } else {
    console.warn('⚠️ Running without database connection. Please set database credentials in .env file.');
  }
}

// Create MySQL connection pool for better reliability
export const connection = (!dbHost || !dbUser || !dbPassword || !dbName) ? null : mysql.createPool({
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

export const db = connection ? drizzle(connection, { schema, mode: 'default' }) : null;

// Test the connection if available
if (connection && dbHost && dbUser && dbPassword && dbName) {
  connection.getConnection()
    .then(conn => {
      console.log('✅ MySQL database connected successfully');
      conn.release();
    })
    .catch(err => {
      console.error('❌ Failed to connect to database:', err);
    });
}
