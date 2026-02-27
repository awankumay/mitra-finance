const { app } = require("./app");
const { env } = require("./config/env");
const { ensureTimezone } = require("./config/timezone");
const { scheduleBackupJob } = require("./jobs/backup.job");

ensureTimezone();

app.listen(env.PORT, () => {
  scheduleBackupJob();
  console.log(`Backend running on port ${env.PORT}`);
});
