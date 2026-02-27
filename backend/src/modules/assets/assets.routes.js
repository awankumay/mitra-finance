const express = require("express");
const { pool } = require("../../config/database");
const { writeAudit } = require("../../utils/audit");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, name, category, description, created_by, created_at
       FROM assets ORDER BY id DESC`,
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, category, description = null } = req.body;

    if (!name || !category) {
      return res
        .status(400)
        .json({ message: "name and category are required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO assets (name, category, description, created_by)
       VALUES (?, ?, ?, ?)`,
      [name, category, description, req.user.id],
    );

    await writeAudit({
      userId: req.user.id,
      actionType: "CREATE",
      entityType: "assets",
      entityId: result.insertId,
      ipAddress: req.ip,
    });

    res.status(201).json({ id: result.insertId });
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, description = null } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({ message: "category is required" });
    }

    const [result] = await pool.execute(
      `UPDATE assets SET name = ?, category = ?, description = ?
       WHERE id = ?`,
      [name, category, description, id],
    );

    if (!result.affectedRows) {
      return res.status(404).json({ message: "Asset not found" });
    }

    await writeAudit({
      userId: req.user.id,
      actionType: "UPDATE",
      entityType: "assets",
      entityId: Number(id),
      ipAddress: req.ip,
    });

    res.json({ id: Number(id) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      await connection.execute(
        "DELETE FROM asset_snapshots WHERE asset_id = ?",
        [id],
      );
      const [result] = await connection.execute(
        "DELETE FROM assets WHERE id = ?",
        [id],
      );

      if (!result.affectedRows) {
        await connection.rollback();
        return res.status(404).json({ message: "Asset not found" });
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    await writeAudit({
      userId: req.user.id,
      actionType: "DELETE",
      entityType: "assets",
      entityId: Number(id),
      ipAddress: req.ip,
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
