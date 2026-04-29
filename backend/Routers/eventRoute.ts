import express from "express";
import {
  ingestEvent,
  ingestBatchEvents,
  getEvents,
  clearEvents,
} from "../Controllers/eventController";

const router = express.Router();

// Single event ingestion
router.post("/ingest", ingestEvent);

// Batch event ingestion
router.post("/ingest-batch", ingestBatchEvents);

// Get events (debugging)
router.get("/", getEvents);

// Clear events (for testing/reset)
router.delete("/clear", clearEvents);

export default router;
