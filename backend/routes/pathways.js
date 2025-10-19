import express from "express";
import { CareerPathways } from "../services/careerpathways.js";

const router = express.Router();
const pathways = new CareerPathways();

/**
 * POST /api/pathways/assess
 * body: {
 *   employeeId: "EMP-20001",
 *   aspiration: {
 *     function_area: "Data & AI",
 *     specialization?: "Analytics",
 *     short_term?: "text",
 *     long_term?: "text"
 *   }
 * }
 */
router.post("/assess", async (req, res) => {
  try {
    const { employeeId, aspiration } = req.body || {};
    if (!employeeId || !aspiration?.function_area) {
      return res
        .status(400)
        .json({ error: "employeeId and aspiration.function_area are required" });
    }
    const result = await pathways.assessFromAspiration(employeeId, aspiration);
    res.json(result);
  } catch (e) {
    console.error("POST /api/pathways/assess error:", e);
    res.status(500).json({ error: "Failed to assess pathways", details: e.message });
  }
});

/**
 * GET /api/pathways/llm/:employeeId
 */
router.get("/llm/:employeeId", async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await pathways.assessFromAspiration(employeeId, {
      function_area: "Data & AI",
    });
    res.json(result);
  } catch (e) {
    console.error("GET /api/pathways/llm/:employeeId error:", e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
