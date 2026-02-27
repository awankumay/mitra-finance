const express = require("express");
const bcrypt = require("bcrypt");

const { pool } = require("../../config/database");
const { env } = require("../../config/env");
const { roleMiddleware } = require("../../middlewares/role.middleware");
const { writeAudit } = require("../../utils/audit");

const router = express.Router();

router.use(roleMiddleware("admin"));

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC",
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, password, role = "user" } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: "Invalid user payload" });
    }

    const passwordHash = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    const [result] = await pool.execute(
      "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [name, email, passwordHash, role],
    );

    await writeAudit({
      userId: req.user.id,
      actionType: "CREATE",
      entityType: "users",
      entityId: result.insertId,
      ipAddress: req.ip,
    });

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
