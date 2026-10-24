import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const db = states[mongoose.connection.readyState] || "unknown";

  res.status(200).json({ status: "ok", db });
});

export default router;
