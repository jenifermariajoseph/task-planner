const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "jenifermariajoseph",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "planner",
  password: process.env.DB_PASSWORD || "",
  port: parseInt(process.env.DB_PORT) || 5432,
});

module.exports = pool;