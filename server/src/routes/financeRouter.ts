import express from "express";
import { getSingleCompanyFinancialStatus } from "../controllers/financeControllers";

const router = express.Router();

router.get("/single", getSingleCompanyFinancialStatus);

export default router;

