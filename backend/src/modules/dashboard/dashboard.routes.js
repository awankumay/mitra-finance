const express = require("express");
const { pool } = require("../../config/database");

const router = express.Router();

router.get("/net-worth", async (req, res, next) => {
  try {
    const days = Number(req.query.days || 30);
    const safeDays = Number.isNaN(days) ? 30 : Math.min(Math.max(days, 1), 365);

    const [rows] = await pool.execute(
      `WITH RECURSIVE date_series AS (
        SELECT DATE_SUB(CURDATE(), INTERVAL ? - 1 DAY) AS dt
        UNION ALL
        SELECT DATE_ADD(dt, INTERVAL 1 DAY)
        FROM date_series
        WHERE dt < CURDATE()
      )
      SELECT
        ds.dt AS snapshot_date,
        COALESCE(SUM(
          (
            SELECT s.value
            FROM asset_snapshots s
            WHERE s.asset_id = a.id
              AND s.snapshot_date <= ds.dt
            ORDER BY s.snapshot_date DESC
            LIMIT 1
          )
        ), 0) AS total_value
      FROM date_series ds
      LEFT JOIN assets a ON a.is_deleted = 0
      GROUP BY ds.dt
      ORDER BY ds.dt ASC`,
      [safeDays],
    );

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
