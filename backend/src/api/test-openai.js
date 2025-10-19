// file used for initial testing
import express from "express";
import { testOpenAI } from "../aiClient.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const msg = await testOpenAI();
    res.json({ ok: true, message: msg });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
