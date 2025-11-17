#!/usr/bin/env node
require("dotenv").config();
const postgres = require("postgres");

(async () => {
  const DATABASE_URL = process.env.POSTGRES_URL;
  if (!DATABASE_URL) {
    console.error("Error: POSTGRES_URL not set in .env");
    process.exit(1);
  }

  // Match how the project config uses postgres (ssl: 'require')
  const sql = postgres(DATABASE_URL, { ssl: "require" });

  const viewSql = `
CREATE OR REPLACE VIEW revenue AS
SELECT
  to_char(date_trunc('month', date), 'YYYY-MM') AS month,
  SUM(amount)::numeric / 100 AS revenue
FROM invoices
GROUP BY 1
ORDER BY 1 DESC;
`;

  try {
    await sql.begin(async (tx) => {
      await tx.unsafe(viewSql);
    });

    console.log('View "revenue" created or replaced successfully.');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error("Error creating view:", err);
    try {
      await sql.end();
    } catch (e) {}
    process.exit(1);
  }
})();
