import { Router } from "express";
import {
  getMetricsWorkers,
  getMetricsWorkstations,
  getMetricsFactory,
} from "../Controllers/metricsController";

const router = Router();

// Worker metrics
router.get("/workers", getMetricsWorkers);

// Workstation metrics
router.get("/workstations", getMetricsWorkstations);

// Factory metrics
router.get("/factory", getMetricsFactory);

export default router;
