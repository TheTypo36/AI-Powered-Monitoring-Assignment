import { Router } from "express";
import { seedDb } from "../Controllers/SeedController";
const router = Router();

router.post("/seed-data", seedDb);

export default router;
