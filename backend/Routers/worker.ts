import { Router } from "express";
const router = Router();
import { getworks } from "../Controllers/workersController";
router.get("/get-workers", getworks);

export default router;
