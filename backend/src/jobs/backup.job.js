const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const { exec } = require("child_process");

const { env } = require("../config/env");

function cleanupOldBackups(backupDir) {
  const files = fs
    .readdirSync(backupDir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => ({
      file,
      fullPath: path.join(backupDir, file),
      ctime: fs.statSync(path.join(backupDir, file)).ctime.getTime(),
    }))
    .sort((a, b) => b.ctime - a.ctime);

  files.slice(env.BACKUP_RETENTION_DAYS).forEach(({ fullPath }) => {
    fs.unlinkSync(fullPath);
  });
}

function runBackup() {
  const backupDir = path.resolve(process.cwd(), env.BACKUP_DIR);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const date = new Date().toISOString().slice(0, 10);
  const filePath = path.join(backupDir, `backup-${date}.sql`);

  const command = `mysqldump -h ${env.DB_HOST} -P ${env.DB_PORT} -u ${env.DB_USER} -p${env.DB_PASS} ${env.DB_NAME} > \"${filePath}\"`;

  exec(command, (error) => {
    if (error) {
      console.error("Backup failed:", error.message);
      return;
    }

    const stats = fs.statSync(filePath);
    if (stats.size <= 0) {
      console.error("Backup validation failed: file size is 0KB");
      return;
    }

    cleanupOldBackups(backupDir);
    console.log("Backup success:", filePath);
  });
}

function scheduleBackupJob() {
  cron.schedule("0 2 * * *", runBackup, { timezone: env.TZ });
}

module.exports = { scheduleBackupJob, runBackup };
