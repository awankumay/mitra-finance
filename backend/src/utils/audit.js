const { pool } = require("../config/database");

async function writeAudit({
  userId,
  actionType,
  entityType,
  entityId = null,
  ipAddress,
}) {
  await pool.execute(
    `INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, ip_address)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, actionType, entityType, entityId, ipAddress],
  );
}

module.exports = { writeAudit };
