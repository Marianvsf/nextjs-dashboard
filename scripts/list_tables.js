#!/usr/bin/env node
require("dotenv").config();
const postgres = require("postgres");

(async () => {
  const DATABASE_URL = process.env.POSTGRES_URL;
  if (!DATABASE_URL) {
    console.error("Error: POSTGRES_URL not set in .env");
    process.exit(1);
  }

  const sql = postgres(DATABASE_URL, { ssl: "require" });

  try {
    const rows = await sql`
      SELECT table_schema, table_name, table_type
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_type, table_name;
    `;

    if (rows.length === 0) {
      console.log("No tables or views found in schema public.");
    } else {
      console.log("Tables and views in schema public:");
      rows.forEach((r) => {
        console.log(
          `${r.table_type.padEnd(6)}  ${r.table_schema}.${r.table_name}`
        );
      });
    }

    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error("Error listing tables:", err);
    try {
      await sql.end();
    } catch (e) {}
    process.exit(1);
  }
})();
