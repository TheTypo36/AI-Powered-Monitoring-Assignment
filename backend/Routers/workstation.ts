import { Router } from "express";
import { getworkstations } from "../Controllers/workstationController";
const router = Router();
router.get("/get-workstation", getworkstations);

export default router;
