const express = require("express");
const { pool } = require("../../config/database");
const { isFutureDate, todayJakarta } = require("../../config/timezone");
const { writeAudit } = require("../../utils/audit");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const assetId = req.query.assetId;
    const params = [];
    let sql = `SELECT id, asset_id, snapshot_date, value, created_by, created_at
               FROM asset_snapshots`;

    if (assetId) {
      sql += " WHERE asset_id = ?";
      params.push(assetId);
    }

    sql += " ORDER BY snapshot_date DESC, id DESC";
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { asset_id: assetId, snapshot_date: snapshotDate, value } = req.body;

    if (!assetId || !snapshotDate || value == null) {
      return res
        .status(400)
        .json({ message: "asset_id, snapshot_date, value are required" });
    }

    if (isFutureDate(snapshotDate)) {
      return res
        .status(400)
        .json({ message: "snapshot_date cannot be in the future" });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO asset_snapshots (asset_id, snapshot_date, value, created_by)
         VALUES (?, ?, ?, ?)`,
        [assetId, snapshotDate, value, req.user.id],
      );

      await writeAudit({
        userId: req.user.id,
        actionType: "CREATE",
        entityType: "snapshots",
        entityId: result.insertId,
        ipAddress: req.ip,
      });

      return res.status(201).json({ id: result.insertId });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ message: "Duplicate snapshot date for this asset" });
      }
      throw error;
    }
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value } = req.body;

    const numericValue = Number(value);
    if (value == null || !Number.isFinite(numericValue) || numericValue < 0) {
      return res
        .status(400)
        .json({ message: "value must be a non-negative finite number" });
    }

    const [rows] = await pool.execute(
      "SELECT id, snapshot_date FROM asset_snapshots WHERE id = ? LIMIT 1",
      [id],
    );
    const snapshot = rows[0];

    if (!snapshot) {
      return res.status(404).json({ message: "Snapshot not found" });
    }

    if (snapshot.snapshot_date.toISOString().slice(0, 10) !== todayJakarta()) {
      await writeAudit({
        userId: req.user.id,
        actionType: "FORBIDDEN_ATTEMPT",
        entityType: "snapshots",
        entityId: Number(id),
        ipAddress: req.ip,
      });
      return res
        .status(403)
        .json({ message: "Historical snapshot is immutable" });
    }

    await pool.execute("UPDATE asset_snapshots SET value = ? WHERE id = ?", [
      numericValue,
      id,
    ]);
    await writeAudit({
      userId: req.user.id,
      actionType: "UPDATE",
      entityType: "snapshots",
      entityId: Number(id),
      ipAddress: req.ip,
    });

    return res.json({ id: Number(id) });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      "SELECT id, snapshot_date FROM asset_snapshots WHERE id = ? LIMIT 1",
      [id],
    );
    const snapshot = rows[0];

    if (!snapshot) {
      return res.status(404).json({ message: "Snapshot not found" });
    }

    const isHistorical =
      snapshot.snapshot_date.toISOString().slice(0, 10) !== todayJakarta();

    if (isHistorical && req.user.role !== "admin") {
      await writeAudit({
        userId: req.user.id,
        actionType: "FORBIDDEN_ATTEMPT",
        entityType: "snapshots",
        entityId: Number(id),
        ipAddress: req.ip,
      });
      return res
        .status(403)
        .json({ message: "Historical snapshot is immutable" });
    }

    await pool.execute("DELETE FROM asset_snapshots WHERE id = ?", [id]);
    await writeAudit({
      userId: req.user.id,
      actionType: "DELETE",
      entityType: "snapshots",
      entityId: Number(id),
      ipAddress: req.ip,
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
