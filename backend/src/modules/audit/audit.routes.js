const express = require("express");
const { pool } = require("../../config/database");
const { roleMiddleware } = require("../../middlewares/role.middleware");

const router = express.Router();

router.use(roleMiddleware("admin"));

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, user_id, action_type, entity_type, entity_id, ip_address, created_at
       FROM audit_logs
       ORDER BY created_at DESC
       LIMIT 500`,
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
