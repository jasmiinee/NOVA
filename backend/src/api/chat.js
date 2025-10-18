import express from "express";
import { chatWithAI } from "../aiClient.js";

const router = express.Router();

/** POST /api/chat  body: { message: string } */
router.post("/", async (req, res) => {
  try {
    const { message = "Hello!" } = req.body || {};
    const reply = await chatWithAI(message);
    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Chat failed", details: e.message });
  }
});

export default router;