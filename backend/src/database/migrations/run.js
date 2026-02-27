const fs = require("fs");
const path = require("path");
const { pool } = require("../../config/database");

const DROP_ORDERED_TABLES = [
  "asset_snapshots",
  "audit_logs",
  "assets",
  "users",
];

async function dropAllTables() {
  await pool.execute("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of DROP_ORDERED_TABLES) {
    await pool.execute(`DROP TABLE IF EXISTS ${table}`);
  }

  await pool.execute("SET FOREIGN_KEY_CHECKS = 1");
}

function isIgnorableMigrationError(error) {
  return ["ER_DUP_KEYNAME"].includes(error.code);
}

async function runMigration() {
  const isForceMode = process.argv.includes("--force");

  if (isForceMode) {
    console.log("Force mode enabled: dropping existing tables...");
    await dropAllTables();
  }

  const migrationPath = path.resolve(__dirname, "001_init.sql");
  const sql = fs.readFileSync(migrationPath, "utf8");
  const statements = sql
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await pool.execute(statement);
    } catch (error) {
      if (isIgnorableMigrationError(error)) {
        console.log(`Skipping existing object: ${error.sqlMessage}`);
        continue;
      }
      throw error;
    }
  }

  console.log("Migration completed");
  await pool.end();
}

runMigration().catch(async (error) => {
  console.error("Migration failed:", error);
  await pool.end();
  process.exit(1);
});
